import logging
from asyncio import TaskGroup

from injector import inject

from burp.config.config import Config
from burp.injector.burp_types import TargetCommandProxies
from burp.serve.events.invalid_event_error import InvalidEventError
from burp.serve.events.proxies.async_proxy import AsyncProxy
from burp.serve.events.proxies.command_proxy import CommandProxy
from burp.target_command.target_command import Build, Clean, FullClean

_LOGGER = logging.getLogger(__name__)


class BuildEventProxy(AsyncProxy):
    @inject
    def __init__(self,
                 build: Build,
                 clean: Clean,
                 full_clean: FullClean,
                 config: Config,
                 proxies: TargetCommandProxies):
        super().__init__()
        self._build = build
        self._clean = clean
        self._full_clean = full_clean
        self._config = config
        self._proxies = proxies
        self._connected = False

    async def connect(self):
        targets = self._config.get_targets()
        for target in targets:
            self._build.register_proxy(target, self._proxies[target.name])
            self._clean.register_proxy(target, self._proxies[target.name])
            self._full_clean.register_proxy(target, self._proxies[target.name])
        self._connected = True
        await self._read()

    def disconnect(self):
        self._connected = False
        targets = self._config.get_targets()
        for target in targets:
            self._build.deregister_proxy(target, self._proxies[target.name])
            self._clean.deregister_proxy(target, self._proxies[target.name])
            self._full_clean.deregister_proxy(target, self._proxies[target.name])

    async def write(self, event: dict):
        match event:
            case {"target": str(target), "event": dict(event)}:
                await self._proxies[target].write(event)
            case _:
                raise InvalidEventError(f'Invalid build event: {event}')

    async def _read(self):
        async with TaskGroup() as task_group:
            for target, proxy in self._proxies.items():
                task_group.create_task(self._read_proxy(target, proxy))

    async def _read_proxy(self, target: str, proxy: CommandProxy):
        while self._connected:
            events = await proxy.read()
            for event in events:
                self.append({"target": target, "event": event})
