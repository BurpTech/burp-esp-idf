#include <stdio.h>
#include <esp_check.h>
#include "burp-blinker.h"

#define LOG_TAG "BurpBlinker"

static esp_err_t doBlink(struct BurpBlinker *pBurpBlinker) {
    if (gpio_get_level(pBurpBlinker->ledPin)) {
        ESP_RETURN_ON_ERROR(
                gpio_set_level(pBurpBlinker->ledPin, 0),
                LOG_TAG,
                "Failed to turn LED off: %s",
                pBurpBlinker->name
        );
        if (pBurpBlinker->remainingBlinks > 0) {
            ESP_RETURN_ON_ERROR(
                    esp_timer_start_once(pBurpBlinker->delayTimer, pBurpBlinker->offUs),
                    LOG_TAG,
                    "Failed to start delay timer to turn LED on: %s",
                    pBurpBlinker->name
            );
        }
    } else {
        ESP_RETURN_ON_ERROR(
                gpio_set_level(pBurpBlinker->ledPin, 1),
                LOG_TAG,
                "Failed to turn LED on: %s",
                pBurpBlinker->name
        );
        pBurpBlinker->remainingBlinks--;
        ESP_RETURN_ON_ERROR(
                esp_timer_start_once(pBurpBlinker->delayTimer, pBurpBlinker->onUs),
                LOG_TAG,
                "Failed to start delay timer to turn LED off: %s",
                pBurpBlinker->name
        );
    }
    return ESP_OK;
}

static void delayTimeout(void *args) {
    struct BurpBlinker *pBurpBlinker = (struct BurpBlinker *) args;
    ESP_ERROR_CHECK(doBlink(pBurpBlinker));
}

static void onBlinkEvent(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    struct BurpBlinkerConfig *pBurpBlinkerConfig = (struct BurpBlinkerConfig *) handler_arg;
    struct BurpBlinker *pBurpBlinker = pBurpBlinkerConfig->pBurpBlinker;
    if (esp_timer_is_active(pBurpBlinker->delayTimer)) {
        ESP_ERROR_CHECK(esp_timer_stop(pBurpBlinker->delayTimer));
    }
    ESP_ERROR_CHECK(gpio_set_level(pBurpBlinker->ledPin, 0));
    pBurpBlinker->remainingBlinks = pBurpBlinkerConfig->blinkCount;
    ESP_ERROR_CHECK(doBlink(pBurpBlinker));
}

esp_err_t burpBlinkerInit(struct BurpBlinker *pBurpBlinker) {
    esp_timer_create_args_t waitTimerArgs = {
            &delayTimeout,
            pBurpBlinker,
            ESP_TIMER_TASK,
            pBurpBlinker->name,
            true
    };
    ESP_RETURN_ON_ERROR(
            esp_timer_create(&waitTimerArgs, &pBurpBlinker->delayTimer),
            LOG_TAG,
            "Failed to create delay timer: %s",
            pBurpBlinker->name
    );
    ESP_RETURN_ON_ERROR(gpio_reset_pin(pBurpBlinker->ledPin), LOG_TAG, "Failed to reset pin: %s",
                        pBurpBlinker->name);
    ESP_RETURN_ON_ERROR(gpio_set_direction(pBurpBlinker->ledPin, GPIO_MODE_INPUT_OUTPUT), LOG_TAG,
                        "Failed to set pin as output: %s", pBurpBlinker->name);
    ESP_RETURN_ON_ERROR(gpio_set_level(pBurpBlinker->ledPin, 0), LOG_TAG,
                        "Failed to set pin level to 0: %s", pBurpBlinker->name);
    for (uint32_t i = 0; i < pBurpBlinker->configCount; i++) {
        struct BurpBlinkerConfig *pBurpBlinkerConfig = &pBurpBlinker->configs[i];
        pBurpBlinkerConfig->pBurpBlinker = pBurpBlinker;
        ESP_RETURN_ON_ERROR(
                esp_event_handler_register(pBurpBlinkerConfig->espEventBase, pBurpBlinkerConfig->eventId, &onBlinkEvent,
                                           pBurpBlinkerConfig),
                LOG_TAG,
                "Failed to register for blink event: %s: %s",
                pBurpBlinker->name,
                pBurpBlinkerConfig->name
        );
    }
    return ESP_OK;
}
