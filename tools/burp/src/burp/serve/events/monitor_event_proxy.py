import logging
from asyncio import TaskGroup

from injector import inject

from burp.config.config import Config
from burp.injector.burp_types import MonitorProxies
from burp.monitor.monitor import Monitor
from burp.serve.events.invalid_event_error import InvalidEventError
from burp.serve.events.proxies.async_proxy import AsyncProxy
from burp.serve.events.proxies.monitor_proxy import MonitorProxy

_LOGGER = logging.getLogger(__name__)


class MonitorEventProxy(AsyncProxy):
    @inject
    def __init__(self, monitor: Monitor, config: Config, proxies: MonitorProxies):
        super().__init__()
        self._monitor = monitor
        self._config = config
        self._proxies = proxies
        self._connected = False

    async def connect(self):
        devices = self._config.get_devices()
        for device in devices:
            self._monitor.register_proxy(device, self._proxies[device.name])
        self._connected = True
        await self._read()

    def disconnect(self):
        self._connected = False
        devices = self._config.get_devices()
        for device in devices:
            self._monitor.deregister_proxy(device, self._proxies[device.name])

    async def write(self, event: dict):
        match event:
            case {"device": str(device), "event": dict(event)}:
                await self._proxies[device].write(event)
            case _:
                raise InvalidEventError(f'Invalid monitor event: {event}')

    async def _read(self):
        async with TaskGroup() as task_group:
            for device, proxy in self._proxies.items():
                task_group.create_task(self._read_proxy(device, proxy))

    async def _read_proxy(self, device: str, proxy: MonitorProxy):
        while self._connected:
            events = await proxy.read()
            for event in events:
                self.append({"device": device, "event": event})
