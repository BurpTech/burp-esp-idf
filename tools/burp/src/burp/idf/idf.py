import logging
from pathlib import Path

from injector import inject

from burp.config.data import Device, Target
from burp.paths.paths import Paths
from burp.runner.proxy import Proxy
from burp.runner.runner import Runner

_LOGGER = logging.getLogger(__name__)
_IDF_COMMAND = Path('idf.py')

_BUILD = 'build'
_CLEAN = 'clean'
_FULL_CLEAN = 'fullclean'
_FLASH = 'flash'


class Idf:
    def __init__(self, cwd: Path, args: str, listener: Proxy):
        self._runner = Runner(
            cwd=cwd,
            cmd=f'{_IDF_COMMAND} {args}',
            listener=listener,
        )

    async def run(self) -> bool:
        return await self._runner.shell()


class BuildIdf(Idf):
    @inject
    def __init__(self, paths: Paths, target: Target, listener: Proxy):
        cwd = paths.target_source_dir(target)
        args = _BUILD
        super().__init__(cwd, args, listener)


class CleanIdf(Idf):
    @inject
    def __init__(self, paths: Paths, target: Target, listener: Proxy):
        cwd = paths.target_source_dir(target)
        args = _CLEAN
        super().__init__(cwd, args, listener)


class FullCleanIdf(Idf):
    @inject
    def __init__(self, paths: Paths, target: Target, listener: Proxy):
        cwd = paths.target_source_dir(target)
        args = _FULL_CLEAN
        super().__init__(cwd, args, listener)


class FlashIdf(Idf):
    @inject
    def __init__(self, paths: Paths, device: Device, listener: Proxy):
        cwd = paths.target_source_dir(device.target)
        args = f'-p {device.port} -b {device.baudrate} {_FLASH}'
        super().__init__(cwd, args, listener)
