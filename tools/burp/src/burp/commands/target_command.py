import logging
from asyncio import TaskGroup

from injector import inject

from burp.config.config import Config
from burp.idf.idf import Idf, Command
from burp.paths.paths import LogFile

_LOGGER = logging.getLogger(__name__)


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
