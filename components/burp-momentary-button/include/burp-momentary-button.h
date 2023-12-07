#ifndef BURP_MOMENTARY_BUTTON_H
#define BURP_MOMENTARY_BUTTON_H

#include <esp_err.h>
#include <driver/gpio.h>
#include <esp_event.h>

#define BURP_MOMENTARY_BUTTON_TASK_STACK_DEPTH 500UL

enum {
    BURP_MOMENTARY_BUTTON_DOWN = 0,
    BURP_MOMENTARY_BUTTON_UP
};

struct BurpMomentaryButton {
    const char *name;
    const esp_event_base_t espEventBase;
    UBaseType_t priority;
    StackType_t stackBuffer[BURP_MOMENTARY_BUTTON_TASK_STACK_DEPTH];
    StaticTask_t taskBuffer;
    TaskHandle_t taskHandle;
    gpio_num_t buttonPin;
};

#define BURP_MOMENTARY_BUTTON(NAME, ESP_EVENT_BASE, PRIORITY) {\
        .name = NAME,\
        .espEventBase = ESP_EVENT_BASE,\
        .priority = PRIORITY\
    }

esp_err_t burpMomentaryButtonInit(gpio_num_t buttonPin, struct BurpMomentaryButton *pBurpMomentaryButton);

#endif //BURP_MOMENTARY_BUTTON_H
