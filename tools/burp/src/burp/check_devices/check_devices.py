import logging

from injector import inject, singleton
from serial.tools.list_ports_common import ListPortInfo
from serial.tools.list_ports_posix import comports

from burp.config.config import Config

_LOGGER = logging.getLogger(__name__)


@singleton
class CheckDevices:
    @inject
    def __init__(self, config: Config):
        self._config = config

    def start(self):
        devices = self._config.get_devices()
        ports: list[ListPortInfo] = comports()
        for device in devices:
            matching_ports: tuple[ListPortInfo, ...] = tuple(filter(lambda p: p.device == device.port, ports))
            if len(matching_ports) == 0:
                _LOGGER.error(f'{device.name} on {device.port} not connected')
            else:
                port = ports.pop(ports.index(matching_ports[0]))
                _LOGGER.info(f'{device.name} detected on {device.port} - {port.description}')
        for port in ports:
            _LOGGER.warning(f'Not configured: {port.device} - {port.description}')
