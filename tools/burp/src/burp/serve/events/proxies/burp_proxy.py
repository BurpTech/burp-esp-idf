import dataclasses
from enum import Enum

from injector import inject

from burp.check_devices.check_devices import CheckDevices
from burp.config.config import Config
from burp.device_command.device_command import Flash
from burp.logger.proxy_handler import Proxy
from burp.serve.events.invalid_event_error import InvalidEventError
from burp.serve.events.proxies.async_proxy import AsyncProxy
from burp.target_command.target_command import Clean, FullClean, Build


class _EventType(str, Enum):
    INIT = 'INIT',
    LOG = 'LOG',
    COMMAND = 'COMMAND',


class _Command(str, Enum):
    CHECK_DEVICES = 'CHECK_DEVICES',
    CLEAN = 'CLEAN',
    FULL_CLEAN = 'FULL_CLEAN',
    BUILD = 'BUILD',
    FLASH = 'FLASH',


class BurpProxy(AsyncProxy, Proxy):
    @inject
    def __init__(self,
                 config: Config,
                 check_devices: CheckDevices,
                 clean: Clean,
                 full_clean: FullClean,
                 build: Build,
                 flash: Flash):
        super().__init__()
        self._config = config
        self._check_devices = check_devices
        self._clean = clean
        self._full_clean = full_clean
        self._build = build
        self._flash = flash

    def init(self):
        devices = self._config.get_devices()
        targets = self._config.get_targets()
        self.append({
            "type": _EventType.INIT,
            "devices": [dataclasses.asdict(device) for device in devices],
            "targets": [dataclasses.asdict(target) for target in targets],
        })

    def receive(self, line: str):
        self.append({
            "type": _EventType.LOG,
            "line": line,
        })

    async def write(self, event: dict) -> None:
        match event:
            case {"type": _EventType.COMMAND, "command": str(command)}:
                await self._start(command)
            case _:
                raise InvalidEventError(f'Invalid burp event: {event}')

    async def _start(self, command: str):
        match command:
            case _Command.CHECK_DEVICES:
                self._check_devices.start()
            case _Command.CLEAN:
                await self._clean.start()
            case _Command.FULL_CLEAN:
                await self._full_clean.start()
            case _Command.BUILD:
                await self._build.start()
            case _Command.FLASH:
                await self._flash.start()
            case _:
                raise InvalidEventError(f'Invalid burp command: {command}')
