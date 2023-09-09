import asyncio
import logging
from pathlib import Path

from injector import inject

from burp.cli.cli_module import RootDirectory
from burp.config import Target, Device, Project
from burp.params import TargetParams, DeviceParams

_LOGGER = logging.getLogger(__name__)
_PROJECTS_DIR = Path('projects')
_IDF_COMMAND = Path('idf.py')


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


class Idf:
    @inject
    def __init__(self, root_directory: RootDirectory):
        self.root_directory = root_directory

    async def run_target(self,
                         *,
                         project: Project,
                         target: Target,
                         params: TargetParams) -> bool:
        cwd = self.root_directory / _PROJECTS_DIR / project.name / target.name
        log_file_path = params.log_file_path(project, target)
        return await _run(cwd, params.command, log_file_path)

    async def run_device(self,
                         *,
                         project: Project,
                         target: Target,
                         device: Device,
                         params: DeviceParams) -> bool:
        cwd = self.root_directory / _PROJECTS_DIR / project.name / target.name
        log_file_path = params.log_file_path(project, target, device)
        return await _run(cwd, f'-p {device.port} {params.command}', log_file_path)
