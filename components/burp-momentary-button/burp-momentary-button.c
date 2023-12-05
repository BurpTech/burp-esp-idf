#include <stdio.h>
#include "burp-momentary-button.h"
#include <esp_check.h>
#include <esp_timer.h>

#define LOG_TAG "BurpMomentaryButton"
#define DEBOUNCE_TIMER_US 10000

static void debounce(void *args) {
    struct BurpMomentaryButton *pBurpMomentaryButton = (struct BurpMomentaryButton *) args;
    static int eventId = BURP_MOMENTARY_BUTTON_UP;
    int newEventId = gpio_get_level(pBurpMomentaryButton->gpioNum);
    if (newEventId != eventId) {
        eventId = newEventId;
        esp_event_post(pBurpMomentaryButton->espEventBase, eventId, NULL, 0, portMAX_DELAY);
    }
}

static void task(void *args) {
    struct BurpMomentaryButton *pBurpMomentaryButton = (struct BurpMomentaryButton *) args;
    BaseType_t xStatus;
    esp_timer_handle_t debounceTimer;
    esp_timer_create_args_t debounceTimerArgs = {
            &debounce,
            pBurpMomentaryButton,
            ESP_TIMER_TASK,
            pBurpMomentaryButton->taskName,
            true
    };
    ESP_ERROR_CHECK(esp_timer_create(&debounceTimerArgs, &debounceTimer));

    for (;;) {
        xStatus = ulTaskNotifyTake(pdFALSE, portMAX_DELAY);
        if (xStatus == pdPASS) {
            if (esp_timer_is_active(debounceTimer)) {
                ESP_ERROR_CHECK(esp_timer_restart(debounceTimer, DEBOUNCE_TIMER_US));
            } else {
                ESP_ERROR_CHECK(esp_timer_start_once(debounceTimer, DEBOUNCE_TIMER_US));
            }
        } else {
//            printf("Could not take from the task notify.\r\n");
        }
    }
}

static void handle_isr(void *args) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    struct BurpMomentaryButton *pBurpMomentaryButton = (struct BurpMomentaryButton *) args;
    vTaskNotifyGiveFromISR(pBurpMomentaryButton->taskHandle, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

esp_err_t burpMomentaryButtonStart(struct BurpMomentaryButton *pBurpMomentaryButton) {
    pBurpMomentaryButton->taskHandle = xTaskCreateStatic(
            &task,
            pBurpMomentaryButton->taskName,
            BURP_MOMENTARY_BUTTON_TASK_STACK_DEPTH,
            (void *) pBurpMomentaryButton,
            pBurpMomentaryButton->priority,
            pBurpMomentaryButton->stackBuffer,
            &pBurpMomentaryButton->taskBuffer
    );
    ESP_RETURN_ON_ERROR(gpio_reset_pin(pBurpMomentaryButton->gpioNum), LOG_TAG, "Failed to reset pin: %s", pBurpMomentaryButton->taskName);
    ESP_RETURN_ON_ERROR(gpio_set_direction(pBurpMomentaryButton->gpioNum, GPIO_MODE_INPUT), LOG_TAG, "Failed to set pin as input: %s", pBurpMomentaryButton->taskName);
    ESP_RETURN_ON_ERROR(gpio_set_pull_mode(pBurpMomentaryButton->gpioNum, GPIO_PULLUP_ONLY), LOG_TAG, "Failed to pull up pin: %s", pBurpMomentaryButton->taskName);
    ESP_RETURN_ON_ERROR(gpio_set_intr_type(pBurpMomentaryButton->gpioNum, GPIO_INTR_ANYEDGE), LOG_TAG, "Failed to set interrupt type: %s", pBurpMomentaryButton->taskName);
    ESP_RETURN_ON_ERROR(gpio_intr_enable(pBurpMomentaryButton->gpioNum), LOG_TAG, "Failed to enable interrupt: %s", pBurpMomentaryButton->taskName);
    ESP_RETURN_ON_ERROR(gpio_isr_handler_add(pBurpMomentaryButton->gpioNum, &handle_isr, (void *) pBurpMomentaryButton), LOG_TAG, "Failed to register ISR handler: %s", pBurpMomentaryButton->taskName);
    return ESP_OK;
}
