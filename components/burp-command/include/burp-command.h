#ifndef BURP_COMMAND_H
#define BURP_COMMAND_H

#include <esp_event.h>
#include <driver/gpio.h>

ESP_EVENT_DECLARE_BASE(COMMAND_EVENT);

enum {
    COMMAND_RESET,
    COMMAND_QUERY,
    COMMAND_ACCESS_POINT,
    COMMAND_WPS_CONFIG,
    COMMAND_WIFI,
    COMMAND_FACTORY_RESET
};

esp_err_t burpCommandInit(gpio_num_t buttonPin, gpio_num_t ledPin);

#endif //BURP_COMMAND_H
