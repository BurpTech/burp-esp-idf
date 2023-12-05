idf_component_register(SRCS "burp-blinker.c"
        INCLUDE_DIRS "include"
        REQUIRES esp_event esp_timer driver)
