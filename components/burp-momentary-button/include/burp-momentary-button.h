#include <esp_err.h>
#include <driver/gpio.h>
#include <esp_event.h>

#define BURP_MOMENTARY_BUTTON_TASK_STACK_DEPTH 500UL

enum {
    BURP_MOMENTARY_BUTTON_DOWN = 0,
    BURP_MOMENTARY_BUTTON_UP
};

struct BurpMomentaryButton {
    const gpio_num_t gpioNum;
    const esp_event_base_t espEventBase;
    const char *taskName;
    UBaseType_t priority;
    StackType_t stackBuffer[BURP_MOMENTARY_BUTTON_TASK_STACK_DEPTH];
    StaticTask_t taskBuffer;
    TaskHandle_t taskHandle;
};

#define BURP_MOMENTARY_BUTTON(GPIO_NUM, ESP_EVENT_BASE, TASK_NAME, PRIORITY) {\
        .gpioNum = GPIO_NUM,\
        .espEventBase = ESP_EVENT_BASE,\
        .taskName = TASK_NAME,\
        .priority = PRIORITY\
    }

esp_err_t burpMomentaryButtonInit(struct BurpMomentaryButton *pBurpMomentaryButton);
