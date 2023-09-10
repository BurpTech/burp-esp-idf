import logging
from asyncio import TaskGroup

from injector import inject

from burp.config import Config, TargetGroup
from burp.idf import Idf, Command
from burp.paths import LogFile

_LOGGER = logging.getLogger(__name__)


class DeviceCommand:
    @inject
    def __init__(self, config: Config, idf: Idf):
        self._config = config
        self._idf = idf

    async def start(self,
                    command: Command,
                    log_file: LogFile,
                    build_first: bool,
                    devices: tuple[str, ...]):
        async with TaskGroup() as task_group:
            for target_group in self._config.get_target_groups(devices):
                task_group.create_task(self._start_target(target_group,
                                                          command,
                                                          log_file,
                                                          build_first))

    async def _start_target(self,
                            target_group: TargetGroup,
                            command: Command,
                            log_file: LogFile,
                            build_first: bool):
        if not build_first or await self._idf.run_target(target=target_group.target,
                                                         command=Command.BUILD,
                                                         log_file=LogFile.BUILD_LOG):
            async with TaskGroup() as task_group:
                for device in target_group.devices:
                    task_group.create_task(self._idf.run_device(device=device,
                                                                command=command,
                                                                log_file=log_file))


class TargetCommand:
    @inject
    def __init__(self, config: Config, idf: Idf):
        self._config = config
        self._idf = idf

    async def start(self,
                    command: Command,
                    log_file: LogFile,
                    devices: tuple[str, ...]):
        async with TaskGroup() as task_group:
            for target in self._config.get_targets(devices):
                task_group.create_task(self._idf.run_target(target=target,
                                                            command=command,
                                                            log_file=log_file))
