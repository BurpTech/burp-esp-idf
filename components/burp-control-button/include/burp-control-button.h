#include <esp_event.h>
#include <esp_timer.h>

struct BurpControlButtonCommand {
    int32_t enterWaitEventId;
    int32_t commandEventId;
    uint64_t waitUs;
};

struct BurpControlButton {
    const char *name;
    const esp_event_base_t espEventBase;
    const esp_event_base_t buttonEvent;
    const uint32_t commandCount;
    struct BurpControlButtonCommand const *commands;
    esp_timer_handle_t waitTimer;
    struct BurpControlButtonCommand const *currentCommand;
};

#define BURP_CONTROL_BUTTON(NAME, ESP_EVENT_BASE, BUTTON_EVENT, COMMAND_COUNT, COMMANDS) { \
        .name = NAME,\
        .espEventBase = ESP_EVENT_BASE,\
        .buttonEvent = BUTTON_EVENT,\
        .commandCount = COMMAND_COUNT,\
        .commands = COMMANDS\
    }

esp_err_t burpControlButtonInit(struct BurpControlButton *pBurpControlButton);
