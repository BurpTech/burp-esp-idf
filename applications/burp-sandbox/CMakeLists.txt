idf_component_register(SRCS "burp-sandbox.c"
                    INCLUDE_DIRS "include"
                    REQUIRES esp_wifi mdns spi_flash)
