import asyncio
import logging
from enum import Enum
from pathlib import Path

from injector import inject, singleton

from burp.config.data import Device, Target
from burp.paths import Paths, LogFile

_LOGGER = logging.getLogger(__name__)
_IDF_COMMAND = Path('idf.py')


class Command(Enum):
    BUILD = 'build'
    CLEAN = 'clean'
    FULL_CLEAN = 'fullclean'
    FLASH = 'flash'
    MONITOR = 'monitor'


async def _run(cwd: Path,
               args: str,
               log_file_path: Path) -> bool:
    cmd = f'{_IDF_COMMAND} {args}'
    _LOGGER.info(f"start: {cwd}: {cmd}")
    log_file_path.parent.mkdir(parents=True, exist_ok=True)
    with log_file_path.open('a') as log_file:
        process = await asyncio.create_subprocess_shell(cmd=cmd,
                                                        stdout=log_file,
                                                        stderr=log_file,
                                                        cwd=cwd)
        await process.wait()
        code = process.returncode
        end_msg = f'end [{code}]: {cwd}: {cmd}'
        if code == 0:
            _LOGGER.info(end_msg)
        else:
            _LOGGER.error(end_msg)
        return code == 0


@singleton
class Idf:
    @inject
    def __init__(self, paths: Paths):
        self._paths = paths

    async def run_target(self,
                         *,
                         target: Target,
                         command: Command,
                         log_file: LogFile) -> bool:
        cwd = self._paths.target_source_dir(target)
        log_file_path = self._paths.target_log(target, log_file)
        return await _run(cwd, command.value, log_file_path)

    async def run_device(self,
                         *,
                         device: Device,
                         command: Command,
                         log_file: LogFile) -> bool:
        cwd = self._paths.target_source_dir(device.target)
        log_file_path = self._paths.device_log(device, log_file)
        return await _run(cwd, f'-p {device.port} {command.value}', log_file_path)
