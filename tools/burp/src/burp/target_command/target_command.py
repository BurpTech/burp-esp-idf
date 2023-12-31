import logging
from asyncio import TaskGroup
from typing import Callable

from injector import inject, singleton, ClassAssistedBuilder

from burp.config.config import Config
from burp.config.data import Target
from burp.idf.idf import Idf, BuildIdf, CleanIdf, FullCleanIdf
from burp.paths.paths import LogFile, Paths
from burp.runner.proxy import Proxy, ProxySwitchboard, LoggingProxy, MultiProxy

_LOGGER = logging.getLogger(__name__)


class TargetCommand:
    def __init__(self,
                 config: Config,
                 paths: Paths,
                 idf_provider: Callable[[Target, Proxy], Idf],
                 log_file: LogFile):
        self._config = config
        self._paths = paths
        self._idf_provider = idf_provider
        self._log_file = log_file
        self._proxy_switchboard = ProxySwitchboard[Target]()

    def register_proxy(self, target: Target, proxy: Proxy):
        self._proxy_switchboard.get_proxy_for_key(target).register(proxy)

    def deregister_proxy(self, target: Target, proxy: Proxy):
        self._proxy_switchboard.get_proxy_for_key(target).deregister(proxy)

    async def start_target(self, target: Target) -> bool:
        logging_proxy = LoggingProxy(self._paths.target_log(target, self._log_file))
        switchboard_proxy = self._proxy_switchboard.get_proxy_for_key(target)
        proxy = MultiProxy([logging_proxy, switchboard_proxy])
        idf = self._idf_provider(target, proxy)
        return await idf.run()

    async def start(self):
        async with TaskGroup() as task_group:
            for target in self._config.get_targets():
                task_group.create_task(self.start_target(target))


@singleton
class Build(TargetCommand):
    @inject
    def __init__(self, config: Config, paths: Paths, idf_builder: ClassAssistedBuilder[BuildIdf]):
        super().__init__(
            config=config,
            paths=paths,
            idf_provider=lambda target, proxy: idf_builder.build(target=target, proxy=proxy),
            log_file=LogFile.BUILD_LOG,
        )


@singleton
class Clean(TargetCommand):
    @inject
    def __init__(self, config: Config, paths: Paths, idf_builder: ClassAssistedBuilder[CleanIdf]):
        super().__init__(
            config=config,
            paths=paths,
            idf_provider=lambda target, proxy: idf_builder.build(target=target, proxy=proxy),
            log_file=LogFile.BUILD_LOG,
        )


@singleton
class FullClean(TargetCommand):
    @inject
    def __init__(self, config: Config, paths: Paths, idf_builder: ClassAssistedBuilder[FullCleanIdf]):
        super().__init__(
            config=config,
            paths=paths,
            idf_provider=lambda target, proxy: idf_builder.build(target=target, proxy=proxy),
            log_file=LogFile.BUILD_LOG,
        )
