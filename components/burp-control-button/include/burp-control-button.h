#ifndef BURP_CONTROL_BUTTON_H
#define BURP_CONTROL_BUTTON_H

#include <esp_event.h>
#include <esp_timer.h>

struct BurpControlButtonCommand {
    const char *name;
    const esp_event_base_t enterWaitEventBase;
    const int32_t enterWaitEventId;
    const esp_event_base_t commandEventBase;
    const int32_t commandEventId;
    const uint64_t waitUs;
};

struct BurpControlButton {
    const char *name;
    const esp_event_base_t buttonEvent;
    const uint32_t commandCount;
    struct BurpControlButtonCommand const *commands;
    esp_timer_handle_t waitTimer;
    struct BurpControlButtonCommand const *currentCommand;
};

#define BURP_CONTROL_BUTTON(NAME, BUTTON_EVENT, COMMAND_COUNT, COMMANDS) { \
        .name = NAME,\
        .buttonEvent = BUTTON_EVENT,\
        .commandCount = COMMAND_COUNT,\
        .commands = COMMANDS\
    }

esp_err_t burpControlButtonInit(struct BurpControlButton *pBurpControlButton);

#endif //BURP_CONTROL_BUTTON_H
