import logging

from injector import inject

from burp.config.config import Config

_LOGGER = logging.getLogger(__name__)


class Monitor:
    @inject
    def __init__(self, config: Config):
        self._config = config

    def start(self, devices: tuple[str, ...]):
        pass
