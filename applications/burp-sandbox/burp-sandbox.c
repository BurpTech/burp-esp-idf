#include <stdio.h>
#include "burp-sandbox.h"
#include "secrets.h"

#include <burp-momentary-button.h>
#include <burp-control-button.h>
#include <burp-blinker.h>

#include <esp_wifi.h>
#include <esp_mac.h>
#include <mdns.h>
#include <sys/unistd.h>

#define MAC_ADDRESS_LEN 6

void on_wifi_sta_start(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data);

void on_wifi_sta_connected(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data);

void on_ip_sta_got_ip(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data);

void on_wifi_sta_disconnected(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data);

void onControl(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data);

#define STRLEN(s) (sizeof(s)/sizeof(s[0]))

#define HOST_NAME_PREFIX "burp-"
#define MDNS_SERVICE_TYPE "_burptech"
#define MDNS_PROTO "_tcp"
#define MDNS_PORT 1234

static uint8_t baseMacAddress[MAC_ADDRESS_LEN];
static char hostName[STRLEN(HOST_NAME_PREFIX) + (MAC_ADDRESS_LEN * 2)];

ESP_EVENT_DEFINE_BASE(BUTTON_EVENT);
ESP_EVENT_DEFINE_BASE(CONTROL_EVENT);

static struct BurpMomentaryButton button = BURP_MOMENTARY_BUTTON(
        GPIO_NUM_0,
        BUTTON_EVENT,
        "button",
        1
);

enum {
    COMMAND_WAIT_NOOP,
    COMMAND_NOOP,
    COMMAND_WAIT_RESET,
    COMMAND_RESET,
    COMMAND_WAIT_QUERY,
    COMMAND_QUERY,
    COMMAND_WAIT_ACCESS_POINT,
    COMMAND_ACCESS_POINT,
    COMMAND_WAIT_WPS_CONFIG,
    COMMAND_WPS_CONFIG,
    COMMAND_WAIT_WIFI,
    COMMAND_WIFI,
    COMMAND_WAIT_FACTORY_RESET,
    COMMAND_FACTORY_RESET
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

#define COMMAND_COUNT 7
static struct BurpControlButtonCommand commands[COMMAND_COUNT] = {{
                                                                          COMMAND_WAIT_NOOP,
                                                                          COMMAND_NOOP,
                                                                          CONTROL_WAIT(NOOP_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          COMMAND_WAIT_RESET,
                                                                          COMMAND_RESET,
                                                                          CONTROL_WAIT(RESET_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          COMMAND_WAIT_QUERY,
                                                                          COMMAND_QUERY,
                                                                          CONTROL_WAIT(QUERY_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          COMMAND_WAIT_ACCESS_POINT,
                                                                          COMMAND_ACCESS_POINT,
                                                                          CONTROL_WAIT(ACCESS_POINT_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          COMMAND_WAIT_WPS_CONFIG,
                                                                          COMMAND_WPS_CONFIG,
                                                                          CONTROL_WAIT(WPS_CONFIG_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          COMMAND_WAIT_WIFI,
                                                                          COMMAND_WIFI,
                                                                          CONTROL_WAIT(WIFI_BLINK_COUNT)
                                                                  },
                                                                  {
                                                                          COMMAND_WAIT_FACTORY_RESET,
                                                                          COMMAND_FACTORY_RESET,
                                                                          CONTROL_WAIT(FACTORY_RESET_BLINK_COUNT)
                                                                  }};

static struct BurpControlButton control = BURP_CONTROL_BUTTON(
        "control",
        CONTROL_EVENT,
        BUTTON_EVENT,
        COMMAND_COUNT,
        commands
);

#define BLINKER_CONFIG_COUNT 7
static struct BurpBlinkerConfig blinks[BLINKER_CONFIG_COUNT] = {
        BURP_BLINKER_CONFIG("noop", CONTROL_EVENT, COMMAND_WAIT_NOOP, NOOP_BLINK_COUNT),
        BURP_BLINKER_CONFIG("reset", CONTROL_EVENT, COMMAND_WAIT_RESET, RESET_BLINK_COUNT),
        BURP_BLINKER_CONFIG("query", CONTROL_EVENT, COMMAND_WAIT_QUERY, QUERY_BLINK_COUNT),
        BURP_BLINKER_CONFIG("access point", CONTROL_EVENT, COMMAND_WAIT_ACCESS_POINT, ACCESS_POINT_BLINK_COUNT),
        BURP_BLINKER_CONFIG("WPS config", CONTROL_EVENT, COMMAND_WAIT_WPS_CONFIG, WPS_CONFIG_BLINK_COUNT),
        BURP_BLINKER_CONFIG("wifi", CONTROL_EVENT, COMMAND_WAIT_WIFI, WIFI_BLINK_COUNT),
        BURP_BLINKER_CONFIG("factory reset", CONTROL_EVENT, COMMAND_WAIT_FACTORY_RESET, FACTORY_RESET_BLINK_COUNT)
};

static struct BurpBlinker blinker = BURP_BLINKER(
        "blinker",
        GPIO_NUM_3,
        BLINK_ON_US,
        BLINK_OFF_US,
        BLINKER_CONFIG_COUNT,
        blinks
);

void start(void) {
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    ESP_ERROR_CHECK(gpio_install_isr_service(GPIO_INTR_ANYEDGE));

    ESP_ERROR_CHECK(burpMomentaryButtonInit(&button));
    ESP_ERROR_CHECK(burpControlButtonInit(&control));

    ESP_ERROR_CHECK(esp_event_handler_register(CONTROL_EVENT, ESP_EVENT_ANY_ID, onControl, NULL));
    ESP_ERROR_CHECK(burpBlinkerInit(&blinker));

    ESP_ERROR_CHECK(esp_netif_init());

    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_START, on_wifi_sta_start, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_CONNECTED, on_wifi_sta_connected, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, on_ip_sta_got_ip, NULL));
    ESP_ERROR_CHECK(
            esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_DISCONNECTED, on_wifi_sta_disconnected, NULL));

    esp_netif_t *espNetIF = esp_netif_create_default_wifi_sta();
    ESP_ERROR_CHECK(esp_base_mac_addr_get(baseMacAddress));
    sprintf(hostName,
            "%s%02X%02X%02X%02X%02X%02X",
            HOST_NAME_PREFIX,
            baseMacAddress[0],
            baseMacAddress[1],
            baseMacAddress[2],
            baseMacAddress[3],
            baseMacAddress[4],
            baseMacAddress[5]);
    ESP_ERROR_CHECK(esp_netif_set_hostname(espNetIF, hostName));

    wifi_init_config_t wifiInitConfig = WIFI_INIT_CONFIG_DEFAULT();
    wifiInitConfig.nvs_enable = 0;
    ESP_ERROR_CHECK(esp_wifi_init(&wifiInitConfig));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));

    wifi_config_t wifiConfig = {
            .sta.ssid = SSID,
            .sta.password = PASSWORD,
    };
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifiConfig));
    ESP_ERROR_CHECK(esp_wifi_start());
}

void on_wifi_sta_start(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    printf("Wifi STA start\n");
    ESP_ERROR_CHECK(esp_wifi_connect());
}

void on_wifi_sta_connected(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    printf("Wifi STA connected\n");
}

void on_ip_sta_got_ip(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    printf("IP STA got IP\n");
    ESP_ERROR_CHECK(mdns_init());
    ESP_ERROR_CHECK(mdns_hostname_set(hostName));
    ESP_ERROR_CHECK(mdns_instance_name_set(hostName));
    ESP_ERROR_CHECK(mdns_service_add(hostName, MDNS_SERVICE_TYPE, MDNS_PROTO, MDNS_PORT, NULL, 0));
    sleep(5);
    mdns_result_t *results = NULL;
    ESP_ERROR_CHECK(mdns_query_ptr(MDNS_SERVICE_TYPE, MDNS_PROTO, 3000, 20, &results));
    if (!results) {
        printf("No MDNS results found\n");
        return;
    }
    mdns_result_t *r = results;
    while (r) {
        printf("PTR: %s\n", r->instance_name);
        r = r->next;
    }
    mdns_query_results_free(results);
}

void on_wifi_sta_disconnected(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    printf("Wifi STA disconnected\n");
    ESP_ERROR_CHECK(esp_wifi_connect());
}

void onControl(void *handler_arg, esp_event_base_t base, int32_t id, void *event_data) {
    switch (id) {
        case COMMAND_WAIT_NOOP:
            printf("wait noop\n");
            break;
        case COMMAND_NOOP:
            printf("noop\n");
            break;
        case COMMAND_WAIT_RESET:
            printf("wait reset\n");
            break;
        case COMMAND_RESET:
            printf("reset\n");
            break;
        case COMMAND_WAIT_QUERY:
            printf("wait query\n");
            break;
        case COMMAND_QUERY:
            printf("query\n");
            break;
        case COMMAND_WAIT_ACCESS_POINT:
            printf("wait access point\n");
            break;
        case COMMAND_ACCESS_POINT:
            printf("access point\n");
            break;
        case COMMAND_WAIT_WPS_CONFIG:
            printf("wait WPS config\n");
            break;
        case COMMAND_WPS_CONFIG:
            printf("WPS config\n");
            break;
        case COMMAND_WAIT_WIFI:
            printf("wait wifi\n");
            break;
        case COMMAND_WIFI:
            printf("wifi\n");
            break;
        case COMMAND_WAIT_FACTORY_RESET:
            printf("wait factory reset\n");
            break;
        case COMMAND_FACTORY_RESET:
            printf("factory reset\n");
            break;
    }
}
