import logging
from enum import Enum

from injector import singleton, inject

from burp.logger.proxy_handler import ProxyHandler


class LogLevel(Enum):
    CRITICAL = 'CRITICAL'
    ERROR = 'ERROR'
    WARNING = 'WARNING'
    INFO = 'INFO'
    DEBUG = 'DEBUG'


@singleton
class LoggingContext:
    @inject
    def __init__(self,
                 file_handler: logging.FileHandler,
                 stdout_handler: logging.StreamHandler,
                 proxy_handler: ProxyHandler):
        self._file_handler = file_handler
        self._stdout_handler = stdout_handler
        self._proxy_handler = proxy_handler

    def setup(self, log_level: str) -> None:
        logger = logging.getLogger()
        logger.setLevel(log_level)
        logger.addHandler(self._file_handler)
        logger.addHandler(self._stdout_handler)
        logger.addHandler(self._proxy_handler)
