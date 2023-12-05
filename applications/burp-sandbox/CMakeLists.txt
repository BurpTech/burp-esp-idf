idf_component_register(SRCS "burp-sandbox.c"
        INCLUDE_DIRS "include"
        PRIV_REQUIRES esp_wifi mdns spi_flash burp-control-button burp-momentary-button)
