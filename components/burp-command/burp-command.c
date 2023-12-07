#include <stdio.h>
#include <esp_check.h>
#include <burp-momentary-button.h>
#include <burp-control-button.h>
#include <burp-blinker.h>
#include "burp-command.h"

#define LOG_TAG "BurpCommand"

ESP_EVENT_DEFINE_BASE(BUTTON_EVENT);
ESP_EVENT_DEFINE_BASE(COMMAND_EVENT);
ESP_EVENT_DEFINE_BASE(INTERNAL_COMMAND_EVENT);

static struct BurpMomentaryButton button = BURP_MOMENTARY_BUTTON(
        "command-button",
        BUTTON_EVENT,
        1
);

enum {
    INTERNAL_COMMAND_WAIT_NOOP,
    INTERNAL_COMMAND_NOOP,
    INTERNAL_COMMAND_WAIT_RESET,
    INTERNAL_COMMAND_WAIT_QUERY,
    INTERNAL_COMMAND_WAIT_ACCESS_POINT,
    INTERNAL_COMMAND_WAIT_WPS_CONFIG,
    INTERNAL_COMMAND_WAIT_WIFI,
    INTERNAL_COMMAND_WAIT_FACTORY_RESET
};

#define BLINK_ON_US 100000
#define BLINK_OFF_US 200000

#define NOOP_BLINK_COUNT 1
#define RESET_BLINK_COUNT 2
#define QUERY_BLINK_COUNT 3
#define ACCESS_POINT_BLINK_COUNT 4
#define WPS_CONFIG_BLINK_COUNT 5
#define WIFI_BLINK_COUNT 6
#define FACTORY_RESET_BLINK_COUNT 7

#define CONTROL_PAUSE_US 2000000

#define CONTROL_WAIT(BLINK_COUNT) ((BLINK_ON_US * BLINK_COUNT) + (BLINK_OFF_US * (BLINK_COUNT - 1)) + CONTROL_PAUSE_US)

#define NOOP_NAME "noop"
#define RESET_NAME "reset"
#define QUERY_NAME "query"
#define ACCESS_POINT_NAME "access point"
#define WPS_CONFIG_NAME "WPS config"
#define WIFI_NAME "wifi"
#define FACTORY_RESET_NAME "factory reset"

#define COMMAND_COUNT 7
static struct BurpControlButtonCommand commands[COMMAND_COUNT] = {{
                                                                          NOOP_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_NOOP,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_NOOP,
                                                                          CONTROL_WAIT(NOOP_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          RESET_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_RESET,
                                                                          COMMAND_EVENT,
                                                                          COMMAND_RESET,
                                                                          CONTROL_WAIT(RESET_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          QUERY_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_QUERY,
                                                                          COMMAND_EVENT,
                                                                          COMMAND_QUERY,
                                                                          CONTROL_WAIT(QUERY_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          ACCESS_POINT_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_ACCESS_POINT,
                                                                          COMMAND_EVENT,
                                                                          COMMAND_ACCESS_POINT,
                                                                          CONTROL_WAIT(ACCESS_POINT_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          WPS_CONFIG_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_WPS_CONFIG,
                                                                          COMMAND_EVENT,
                                                                          COMMAND_WPS_CONFIG,
                                                                          CONTROL_WAIT(WPS_CONFIG_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          WIFI_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_WIFI,
                                                                          COMMAND_EVENT,
                                                                          COMMAND_WIFI,
                                                                          CONTROL_WAIT(WIFI_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          FACTORY_RESET_NAME,
                                                                          INTERNAL_COMMAND_EVENT,
                                                                          INTERNAL_COMMAND_WAIT_FACTORY_RESET,
                                                                          COMMAND_EVENT,
                                                                          COMMAND_FACTORY_RESET,
                                                                          CONTROL_WAIT(FACTORY_RESET_BLINK_COUNT)
                                                                  }};

static struct BurpControlButton control = BURP_CONTROL_BUTTON(
        "command-control",
        BUTTON_EVENT,
        COMMAND_COUNT,
        commands
);

#define BLINKER_CONFIG_COUNT 7
static struct BurpBlinkerConfig blinks[BLINKER_CONFIG_COUNT] = {
        BURP_BLINKER_CONFIG(NOOP_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_NOOP, NOOP_BLINK_COUNT),
        BURP_BLINKER_CONFIG(RESET_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_RESET, RESET_BLINK_COUNT),
        BURP_BLINKER_CONFIG(QUERY_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_QUERY, QUERY_BLINK_COUNT),
        BURP_BLINKER_CONFIG(ACCESS_POINT_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_ACCESS_POINT, ACCESS_POINT_BLINK_COUNT),
        BURP_BLINKER_CONFIG(WPS_CONFIG_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_WPS_CONFIG, WPS_CONFIG_BLINK_COUNT),
        BURP_BLINKER_CONFIG(WIFI_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_WIFI, WIFI_BLINK_COUNT),
        BURP_BLINKER_CONFIG(FACTORY_RESET_NAME, INTERNAL_COMMAND_EVENT, INTERNAL_COMMAND_WAIT_FACTORY_RESET, FACTORY_RESET_BLINK_COUNT)
};

static struct BurpBlinker blinker = BURP_BLINKER(
        "command-blinker",
        BLINK_ON_US,
        BLINK_OFF_US,
        BLINKER_CONFIG_COUNT,
        blinks
);

esp_err_t burpCommandInit(gpio_num_t buttonPin, gpio_num_t ledPin) {
    ESP_RETURN_ON_ERROR(
            burpMomentaryButtonInit(buttonPin, &button),
            LOG_TAG,
            "Failed to initialise the command button"
    );
    ESP_RETURN_ON_ERROR(
            burpControlButtonInit(&control),
            LOG_TAG,
            "Failed to initialise the control button"
    );
    ESP_RETURN_ON_ERROR(
            burpBlinkerInit(ledPin, &blinker),
            LOG_TAG,
            "Failed to initialise the blinker button"
    );
    return ESP_OK;
}
