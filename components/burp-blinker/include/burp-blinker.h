#ifndef BURP_BLINKER_H
#define BURP_BLINKER_H

#include <esp_event.h>
#include <esp_timer.h>
#include <driver/gpio.h>

struct BurpBlinkerConfig {
    const char *name;
    const esp_event_base_t espEventBase;
    const int32_t eventId;
    const uint32_t blinkCount;
    struct BurpBlinker *pBurpBlinker;
};

#define BURP_BLINKER_CONFIG(NAME, ESP_EVENT_BASE, EVENT_ID, BLINK_COUNT) { \
        .name = NAME,\
        .espEventBase = ESP_EVENT_BASE,\
        .eventId = EVENT_ID,\
        .blinkCount = BLINK_COUNT\
    }

struct BurpBlinker {
    const char *name;
    const uint64_t onUs;
    const uint64_t offUs;
    const uint32_t configCount;
    struct BurpBlinkerConfig *configs;
    esp_timer_handle_t delayTimer;
    uint32_t remainingBlinks;
    gpio_num_t ledPin;
};

#define BURP_BLINKER(NAME, ON_US, OFF_US, CONFIG_COUNT, CONFIGS) { \
        .name = NAME,\
        .onUs = ON_US,\
        .offUs = OFF_US,\
        .configCount = CONFIG_COUNT,\
        .configs = CONFIGS\
    }

esp_err_t burpBlinkerInit(gpio_num_t ledPin, struct BurpBlinker *pBurpBlinker);

#endif //BURP_BLINKER_H
