#include <stdio.h>
#include "burp-sandbox.h"
#include "secrets.h"

#include <esp_wifi.h>
#include <esp_mac.h>
#include <mdns.h>
#include <sys/unistd.h>

#define MAC_ADDRESS_LEN 6

void on_wifi_sta_start(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data);
void on_wifi_sta_connected(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data);
void on_ip_sta_got_ip(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data);
void on_wifi_sta_disconnected(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data);

#define STRLEN(s) (sizeof(s)/sizeof(s[0]))

#define HOST_NAME_PREFIX "burp-"
#define MDNS_SERVICE_TYPE "_burptech"
#define MDNS_PROTO "_tcp"
#define MDNS_PORT 1234

static uint8_t baseMacAddress[MAC_ADDRESS_LEN];
static char hostName[STRLEN(HOST_NAME_PREFIX) + (MAC_ADDRESS_LEN * 2)];

void start(void)
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_START, on_wifi_sta_start, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_CONNECTED, on_wifi_sta_connected, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, on_ip_sta_got_ip, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, WIFI_EVENT_STA_DISCONNECTED, on_wifi_sta_disconnected, NULL));

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

void on_wifi_sta_start(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data)
{
    printf("Wifi STA start\n");
    ESP_ERROR_CHECK(esp_wifi_connect());
}

void on_wifi_sta_connected(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data)
{
    printf("Wifi STA connected\n");
}

void on_ip_sta_got_ip(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data)
{
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
    mdns_result_t *r  = results;
    while (r) {
        printf("PTR: %s\n", r->instance_name);
        r = r->next;
    }
    mdns_query_results_free(results);
}

void on_wifi_sta_disconnected(void* handler_arg, esp_event_base_t base, int32_t id, void* event_data)
{
    printf("Wifi STA disconnected\n");
    ESP_ERROR_CHECK(esp_wifi_connect());
}
