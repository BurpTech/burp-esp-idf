import logging
from asyncio import TaskGroup

from injector import inject

from burp.config import Config, Target, Project
from burp.idf import Idf
from burp.params import DeviceParams, TargetParams, BUILD

_LOGGER = logging.getLogger(__name__)


class DeviceCommand:
    @inject
    def __init__(self, config: Config, idf: Idf):
        self._config = config
        self._idf = idf

    async def start(self,
                    params: DeviceParams):
        async with TaskGroup() as task_group:
            for project in self._config.projects:
                for target in project.targets:
                    task_group.create_task(self._start_target(project,
                                                              target,
                                                              params))

    async def _start_target(self,
                            project: Project,
                            target: Target,
                            params: DeviceParams):
        if not params.build_first or await self._idf.run_target(project=project,
                                                                target=target,
                                                                params=BUILD):
            async with TaskGroup() as task_group:
                for device in target.devices:
                    task_group.create_task(self._idf.run_device(project=project,
                                                                target=target,
                                                                device=device,
                                                                params=params))


class TargetCommand:
    @inject
    def __init__(self, config: Config, idf: Idf):
        self._config = config
        self._idf = idf

    async def start(self,
                    params: TargetParams):
        async with TaskGroup() as task_group:
            for project in self._config.projects:
                for target in project.targets:
                    task_group.create_task(self._idf.run_target(project=project,
                                                                target=target,
                                                                params=params))
