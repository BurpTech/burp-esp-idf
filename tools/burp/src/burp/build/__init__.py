import logging

from injector import inject

from burp.config import Config

_LOGGER = logging.getLogger(__name__)


class Build:
    @inject
    def __init__(self, config: Config):
        self._config = config

    def start(self):
        _LOGGER.info("config: %s", self._config)
        # collect all the targets that need building
