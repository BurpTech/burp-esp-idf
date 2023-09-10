from enum import Enum
from pathlib import Path

from injector import singleton, inject

from burp.cli.burp_module import RootDirectory, OutputDirectory
from burp.config.data import Device, Target

_BURP_LOG = 'burp.log'
_PROJECTS_DIR = 'projects'


class LogFile(Enum):
    BUILD_LOG = 'build.log'
    FLASH_LOG = 'flash.log'
    MONITOR_LOG = 'monitor.log'


@singleton
class Paths:
    @inject
    def __init__(self, root_directory: RootDirectory, output_directory: OutputDirectory):
        self._root_directory = root_directory
        self._output_directory = output_directory

    def burp_log(self) -> Path:
        return self._output_directory / _BURP_LOG

    def target_source_dir(self, target: Target) -> Path:
        return self._root_directory / _PROJECTS_DIR / target.project / target.name

    def _target_dir(self, target: Target) -> Path:
        return self._output_directory / target.project / target.name

    def _device_dir(self, device: Device) -> Path:
        return self._target_dir(device.target) / device.name

    def target_log(self, target: Target, log_file: LogFile) -> Path:
        return self._target_dir(target) / log_file.value

    def device_log(self, device: Device, log_file: LogFile) -> Path:
        return self._device_dir(device) / log_file.value
