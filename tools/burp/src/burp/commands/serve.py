import dataclasses
import logging
from asyncio import CancelledError
from asyncio import Protocol, Future, create_task, TaskGroup, StreamWriter
from base64 import b64encode, b64decode
from json import dumps, loads
from typing import Any, Callable

from injector import inject, singleton
from quart import Quart, websocket
from serial_asyncio import SerialTransport

from burp.commands.check_devices import CheckDevices
from burp.commands.device_command import Flash
from burp.commands.monitor import Monitor
from burp.commands.target_command import Build, Clean, FullClean
from burp.config.config import Config
from burp.config.data import Device, Target
from burp.logger.proxy_handler import Proxy as LoggerProxy, ProxyHandler
from burp.runner.proxy import Proxy as RunnerProxy

_LOGGER = logging.getLogger(__name__)


class AsyncProxy:
    def __init__(self):
        self._ready: Future[None] = Future()
        self._events: list[str] = []

    def _append(self, event: str):
        self._events.append(event)
        if not self._ready.done():
            self._ready.set_result(None)

    async def read(self) -> list[str]:
        await self._ready
        self._ready = Future()
        events = self._events
        self._events = []
        return events


class BurpProxy(AsyncProxy, LoggerProxy):
    def __init__(self):
        super().__init__()

    def receive(self, line: str):
        self._append(line)


class CommandProxy(AsyncProxy, RunnerProxy):
    def __init__(self):
        super().__init__()
        self._stdin: StreamWriter | None = None

    def start(self, stdin: StreamWriter):
        self._append(dumps({
            'event': 'START',
        }))

    def complete(self, exit_code: int):
        if self._stdin is not None:
            self._stdin = None
        self._append(dumps({
            'event': 'COMPLETE',
            'exit_code': exit_code,
        }))

    def receive_stdout(self, data: bytes):
        self._append(dumps({
            'event': 'STDOUT',
            'data': b64encode(data).decode(),
        }))

    def receive_stderr(self, data: bytes):
        self._append(dumps({
            'event': 'STDERR',
            'data': b64encode(data).decode(),
        }))

    async def send_data(self, data: bytes) -> None:
        if self._stdin is not None:
            self._stdin.write(data)
            await self._stdin.drain()


class MonitorProxy(AsyncProxy, Protocol):
    def __init__(self):
        super().__init__()
        self._transport: SerialTransport | None = None

    def connection_made(self, transport: SerialTransport) -> None:
        self._transport = transport
        self._append(dumps({
            'event': 'CONNECTION_MADE',
        }))

    def connection_lost(self, exc: Exception | None) -> None:
        self._transport = None
        self._append(dumps({
            'event': 'CONNECTION_LOST',
        }))

    def data_received(self, data: bytes) -> None:
        self._append(dumps({
            'event': 'DATA_RECEIVED',
            'data': b64encode(data).decode(),
        }))

    def send_data(self, data: bytes) -> None:
        if self._transport is not None:
            self._transport.write(data)
            self._transport.flush()


def _create_command_websocket(app: Quart,
                              register: Callable[[CommandProxy], Callable[[], None]],
                              context: str,
                              name: str):
    @app.websocket(f'/{context}/{name}', endpoint=f'{context}-{name}')
    async def command_websocket():
        _LOGGER.info(f'{context}_websocket: {name}')
        proxy = CommandProxy()

        async def sending():
            while True:
                events = await proxy.read()
                for event in events:
                    await websocket.send(event)

        async def receiving():
            while True:
                data = await websocket.receive()
                event = loads(data)
                event_type = event.get('event')
                if event_type == 'DATA':
                    event_data = event.get('data')
                    if event_data is not None:
                        decoded = b64decode(event_data)
                        _LOGGER.info(f'command: {context}: {name}: received: {decoded}')
                        await proxy.send_data(decoded)

        deregister = register(proxy)
        try:
            async with TaskGroup() as task_group:
                task_group.create_task(sending())
                task_group.create_task(receiving())
        except CancelledError:
            deregister()
            raise


@singleton
class Serve:
    @inject
    def __init__(self,
                 config: Config,
                 logging_handler: ProxyHandler,
                 monitor: Monitor,
                 flash: Flash,
                 build: Build,
                 clean: Clean,
                 full_clean: FullClean,
                 check_devices: CheckDevices):
        self._config = config
        self._logging_handler = logging_handler
        self._monitor = monitor
        self._flash = flash
        self._build = build
        self._clean = clean
        self._full_clean = full_clean
        self._check_devices = check_devices

    def _create_burp_websocket(self, app: Quart):
        @app.websocket(f'/burp')
        async def burp_websocket():
            _LOGGER.info('burp_websocket')
            proxy = BurpProxy()

            async def sending():
                while True:
                    events = await proxy.read()
                    for event in events:
                        await websocket.send(event)

            async def receiving():
                while True:
                    # ignore received data but monitor for
                    # disconnects (CancelledError)
                    await websocket.receive()

            self._logging_handler.register(proxy)
            try:
                async with TaskGroup() as task_group:
                    task_group.create_task(sending())
                    task_group.create_task(receiving())
            except CancelledError:
                self._logging_handler.deregister(proxy)
                raise

    def _create_monitor_websocket(self, app: Quart, device: Device):
        @app.websocket(f'/monitor/{device.name}', endpoint=f'monitor-{device.name}')
        async def monitor_websocket():
            _LOGGER.info(f'monitor_websocket: {device.name}')
            proxy = MonitorProxy()

            async def sending():
                while True:
                    events = await proxy.read()
                    for event in events:
                        await websocket.send(event)

            async def receiving():
                while True:
                    data = await websocket.receive()
                    event = loads(data)
                    event_type = event.get('event')
                    if event_type == 'DATA':
                        event_data = event.get('data')
                        if event_data is not None:
                            decoded = b64decode(event_data)
                            _LOGGER.info(f'monitor: {device.name}: received: {decoded}')
                            proxy.send_data(decoded)

            self._monitor.register_proxy(device, proxy)
            try:
                async with TaskGroup() as task_group:
                    task_group.create_task(sending())
                    task_group.create_task(receiving())
            except CancelledError:
                self._monitor.deregister_proxy(device, proxy)
                raise

    def _create_flash_websocket(self, app: Quart, device: Device):
        def register(proxy: CommandProxy) -> Callable[[], None]:
            def deregister():
                self._flash.deregister_proxy(device, proxy)

            self._flash.register_proxy(device, proxy)
            return deregister

        _create_command_websocket(app, register, 'flash', device.name)

    def _create_build_websocket(self, app: Quart, target: Target):
        def register(proxy: CommandProxy) -> Callable[[], None]:
            def deregister():
                self._build.deregister_proxy(target, proxy)
                self._clean.deregister_proxy(target, proxy)
                self._full_clean.deregister_proxy(target, proxy)

            self._build.register_proxy(target, proxy)
            self._clean.register_proxy(target, proxy)
            self._full_clean.register_proxy(target, proxy)
            return deregister

        _create_command_websocket(app, register, 'build', target.name)

    def _create_websockets(self, device_filter: tuple[str, ...], app: Quart):
        self._create_burp_websocket(app)
        for device in self._config.get_devices(device_filter):
            self._create_monitor_websocket(app, device)
            self._create_flash_websocket(app, device)
        for target in self._config.get_targets(device_filter):
            self._create_build_websocket(app, target)

    def _create_get_endpoints(self, device_filter: tuple[str, ...], app: Quart):
        @app.get('/devices')
        async def get_devices() -> Any:
            _LOGGER.info('get_devices')
            devices = self._config.get_devices(device_filter)
            return [dataclasses.asdict(device) for device in devices]

        @app.get('/targets')
        async def get_targets() -> Any:
            _LOGGER.info('get_targets')
            targets = self._config.get_targets(device_filter)
            return [dataclasses.asdict(target) for target in targets]

        @app.get('/check-devices')
        async def get_check_devices() -> Any:
            _LOGGER.info('get_check_devices')
            self._check_devices.start(device_filter)
            return dumps({'msg': 'Check devices started'})

        @app.get('/build')
        async def get_build() -> Any:
            _LOGGER.info('get_build')
            create_task(self._build.start(device_filter))
            return dumps({'msg': 'Build started'})

        @app.get('/clean')
        async def get_clean() -> Any:
            _LOGGER.info('get_clean')
            create_task(self._clean.start(device_filter))
            return dumps({'msg': 'Clean started'})

        @app.get('/fullclean')
        async def get_full_clean() -> Any:
            _LOGGER.info('get_full_clean')
            create_task(self._full_clean.start(device_filter))
            return dumps({'msg': 'Full clean started'})

        @app.get('/flash')
        async def get_flash() -> Any:
            _LOGGER.info('get_flash')
            create_task(self._flash.start(device_filter))
            return dumps({'msg': 'Flash started'})

    def start(self, port: int, device_filter: tuple[str, ...]):
        app = Quart('burp')

        @app.before_serving
        async def start_monitor():
            create_task(self._monitor.start(device_filter))

        @app.after_serving
        async def stop_monitor():
            self._monitor.stop()

        self._create_get_endpoints(device_filter, app)
        self._create_websockets(device_filter, app)

        app.run(port=port)
