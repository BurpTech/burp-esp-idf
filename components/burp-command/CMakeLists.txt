idf_component_register(SRCS "burp-command.c"
                    INCLUDE_DIRS "include"
                    PRIV_REQUIRES burp-blinker burp-control-button
                    REQUIRES driver)
