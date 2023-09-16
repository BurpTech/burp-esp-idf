from asyncio import TaskGroup
from enum import Enum

from injector import inject

from burp.logger.proxy_handler import ProxyHandler
from burp.serve.events.build_event_proxy import BuildEventProxy
from burp.serve.events.flash_event_proxy import FlashEventProxy
from burp.serve.events.invalid_event_error import InvalidEventError
from burp.serve.events.monitor_event_proxy import MonitorEventProxy
from burp.serve.events.proxies.async_proxy import AsyncProxy
from burp.serve.events.proxies.burp_proxy import BurpProxy


class _EventType(str, Enum):
    BURP = 'BURP',
    MONITOR = 'MONITOR',
    FLASH = 'FLASH',
    BUILD = 'BUILD',


class EventProxy(AsyncProxy):
    @inject
    def __init__(self,
                 logging_handler: ProxyHandler,
                 burp_proxy: BurpProxy,
                 monitor_events: MonitorEventProxy,
                 flash_events: FlashEventProxy,
                 build_events: BuildEventProxy):
        super().__init__()
        self._logging_handler = logging_handler
        self._burp_proxy = burp_proxy
        self._monitor_events = monitor_events
        self._flash_events = flash_events
        self._build_events = build_events
        self._connected = False

    async def connect(self):
        self._logging_handler.register(self._burp_proxy)
        self._connected = True
        self._burp_proxy.init()
        async with TaskGroup() as task_group:
            task_group.create_task(self._monitor_events.connect())
            task_group.create_task(self._flash_events.connect())
            task_group.create_task(self._build_events.connect())
            task_group.create_task(self._read())

    def disconnect(self):
        self._connected = False
        self._logging_handler.deregister(self._burp_proxy)
        self._monitor_events.disconnect()
        self._flash_events.disconnect()
        self._build_events.disconnect()

    async def write(self, event: dict):
        match event:
            case {"type": _EventType.BURP, "event": dict(event)}:
                await self._burp_proxy.write(event)
            case {"type": _EventType.MONITOR, "event": dict(event)}:
                await self._monitor_events.write(event)
            case {"type": _EventType.FLASH, "event": event}:
                await self._flash_events.write(event)
            case {"type": _EventType.BUILD, "event": event}:
                await self._build_events.write(event)
            case _:
                raise InvalidEventError(f'Invalid event: {event}')

    async def _read(self):
        async with TaskGroup() as task_group:
            task_group.create_task(self._read_burp_events())
            task_group.create_task(self._read_monitor_events())
            task_group.create_task(self._read_flash_events())
            task_group.create_task(self._read_build_events())

    async def _read_burp_events(self):
        while self._connected:
            events = await self._burp_proxy.read()
            for event in events:
                self.append({"type": _EventType.BURP, "event": event})

    async def _read_monitor_events(self):
        while self._connected:
            events = await self._monitor_events.read()
            for event in events:
                self.append({"type": _EventType.MONITOR, "event": event})

    async def _read_flash_events(self):
        while self._connected:
            events = await self._flash_events.read()
            for event in events:
                self.append({"type": _EventType.FLASH, "event": event})

    async def _read_build_events(self):
        while self._connected:
            events = await self._build_events.read()
            for event in events:
                self.append({"type": _EventType.BUILD, "event": event})
