import logging
from asyncio import TaskGroup
from typing import Callable

from injector import inject, singleton, ClassAssistedBuilder

from burp.commands.monitor import Monitor
from burp.commands.target_command import Build
from burp.config.config import Config, TargetGroup
from burp.config.data import Device
from burp.idf.idf import Idf, FlashIdf
from burp.logger.logging_context import LogLevel
from burp.paths.paths import LogFile, Paths
from burp.runner.proxy import Proxy, ProxySwitchboard, LoggingProxy, MultiProxy

_LOGGER = logging.getLogger(__name__)


class DeviceCommand:
    def __init__(self,
                 config: Config,
                 paths: Paths,
                 monitor: Monitor,
                 idf_provider: Callable[[Device, Proxy], Idf],
                 build: Build,
                 log_file: LogFile,
                 build_first: bool,
                 pause_monitor: bool):
        self._config = config
        self._paths = paths
        self._monitor = monitor
        self._idf_provider = idf_provider
        self._build = build
        self._log_file = log_file
        self._build_first = build_first
        self._pause_monitor = pause_monitor
        self._proxy_switchboard = ProxySwitchboard[Device]()

    def register_proxy(self, device: Device, proxy: Proxy):
        self._proxy_switchboard.get_proxy_for_key(device).register(proxy)

    def deregister_proxy(self, device: Device, proxy: Proxy):
        self._proxy_switchboard.get_proxy_for_key(device).deregister(proxy)

    async def start(self,
                    device_filter: tuple[str, ...]):
        async with TaskGroup() as task_group:
            for target_group in self._config.get_target_groups(device_filter):
                task_group.create_task(self.start_target(target_group))

    async def start_target(self, target_group: TargetGroup):
        if self._build_first:
            for device in target_group.devices:
                self._proxy_switchboard.get_proxy_for_key(device).log(LogLevel.INFO.value, 'Starting build')
            if await self._build.start_target(target_group.target):
                for device in target_group.devices:
                    self._proxy_switchboard.get_proxy_for_key(device).log(LogLevel.INFO.value, 'Build completed')
            else:
                for device in target_group.devices:
                    self._proxy_switchboard.get_proxy_for_key(device).log(LogLevel.ERROR.value, 'Build failed')
                return
        async with TaskGroup() as task_group:
            for device in target_group.devices:
                task_group.create_task(self.start_device(device))

    async def start_device(self, device: Device) -> bool:
        if self._pause_monitor:
            self._monitor.pause_device(device)
        logging_proxy = LoggingProxy(self._paths.device_log(device, self._log_file))
        switchboard_proxy = self._proxy_switchboard.get_proxy_for_key(device)
        proxy = MultiProxy([logging_proxy, switchboard_proxy])
        idf = self._idf_provider(device, proxy)
        success = await idf.run()
        if self._pause_monitor:
            self._monitor.resume_device(device)
        return success


@singleton
class Flash(DeviceCommand):
    @inject
    def __init__(self, config: Config, paths: Paths, monitor: Monitor, build: Build,
                 idf_builder: ClassAssistedBuilder[FlashIdf]):
        super().__init__(
            config=config,
            paths=paths,
            monitor=monitor,
            idf_provider=lambda device, proxy: idf_builder.build(device=device, proxy=proxy),
            build=build,
            log_file=LogFile.FLASH_LOG,
            build_first=True,
            pause_monitor=True,
        )
