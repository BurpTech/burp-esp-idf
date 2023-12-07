#include <esp_check.h>
#include <burp-momentary-button.h>
#include "burp-control-button.h"

#define LOG_TAG "BurpControlButton"

static esp_err_t doWait(struct BurpControlButton *pBurpControlButton) {
    struct BurpControlButtonCommand const *currentCommand = pBurpControlButton->currentCommand;
    ESP_RETURN_ON_ERROR(
            esp_timer_start_once(pBurpControlButton->waitTimer, currentCommand->waitUs),
            LOG_TAG,
            "Failed to start timer: %s",
            pBurpControlButton->name
    );
    ESP_RETURN_ON_ERROR(
            esp_event_post(currentCommand->enterWaitEventBase, currentCommand->enterWaitEventId, NULL,
                           0, portMAX_DELAY),
            LOG_TAG,
            "Failed to post wait event: %s: %s",
            pBurpControlButton->name,
            currentCommand->name
    );
    return ESP_OK;
}

static esp_err_t doCommand(struct BurpControlButton *pBurpControlButton) {
    struct BurpControlButtonCommand const *currentCommand = pBurpControlButton->currentCommand;
    ESP_RETURN_ON_ERROR(
            esp_timer_stop(pBurpControlButton->waitTimer),
            LOG_TAG,
            "Failed to stop wait timer: %s",
            pBurpControlButton->name
    );
    esp_event_base_t eventBase = currentCommand->commandEventBase;
    int32_t eventId = currentCommand->commandEventId;
    const char *name = currentCommand->name;
    pBurpControlButton->currentCommand = NULL;
    ESP_RETURN_ON_ERROR(
            esp_event_post(eventBase, eventId, NULL, 0, portMAX_DELAY),
            LOG_TAG,
            "Failed to post command event: %s: %s",
            pBurpControlButton->name,
            name
    );
    return ESP_OK;
}

static void onButtonDown(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    struct BurpControlButton *pBurpControlButton = (struct BurpControlButton *) handler_arg;
    pBurpControlButton->currentCommand = pBurpControlButton->commands;
    ESP_ERROR_CHECK(doWait(pBurpControlButton));
}

static void onButtonUp(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    struct BurpControlButton *pBurpControlButton = (struct BurpControlButton *) handler_arg;
    ESP_ERROR_CHECK(doCommand(pBurpControlButton));
}

static void waitTimeout(void *args) {
    struct BurpControlButton *pBurpControlButton = (struct BurpControlButton *) args;
    pBurpControlButton->currentCommand++;
    if (pBurpControlButton->currentCommand == &pBurpControlButton->commands[pBurpControlButton->commandCount]) {
        pBurpControlButton->currentCommand = pBurpControlButton->commands;
    }
    ESP_ERROR_CHECK(doWait(pBurpControlButton));
}

esp_err_t burpControlButtonInit(struct BurpControlButton *pBurpControlButton) {
    pBurpControlButton->currentCommand = NULL;
    esp_timer_create_args_t waitTimerArgs = {
            &waitTimeout,
            pBurpControlButton,
            ESP_TIMER_TASK,
            pBurpControlButton->name,
            true
    };
    ESP_RETURN_ON_ERROR(
            esp_timer_create(&waitTimerArgs, &pBurpControlButton->waitTimer),
            LOG_TAG,
            "Failed to create wait timer: %s",
            pBurpControlButton->name
    );
    ESP_RETURN_ON_ERROR(
            esp_event_handler_register(pBurpControlButton->buttonEvent, BURP_MOMENTARY_BUTTON_DOWN, onButtonDown,
                                       pBurpControlButton),
            LOG_TAG,
            "Failed to register button down event: %s",
            pBurpControlButton->name
    );
    ESP_RETURN_ON_ERROR(
            esp_event_handler_register(pBurpControlButton->buttonEvent, BURP_MOMENTARY_BUTTON_UP, onButtonUp,
                                       pBurpControlButton),
            LOG_TAG,
            "Failed to register button up handler: %s",
            pBurpControlButton->name
    );
    return ESP_OK;
}
