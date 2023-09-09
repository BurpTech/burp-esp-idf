from enum import Enum
from pathlib import Path

from burp.config import Device, Target, Project

_DOT_FOLDER = Path('.burp')
_BURP_LOG = Path('burp.log')
_BUILD_LOG = 'build.log'
_FLASH_LOG = 'flash.log'
_MONITOR_LOG = 'monitor.log'


class LogLevel(Enum):
    CRITICAL = 'CRITICAL'
    ERROR = 'ERROR'
    WARNING = 'WARNING'
    INFO = 'INFO'
    DEBUG = 'DEBUG'


DEFAULT_CONFIG_FILE = Path('burp.yml')
DEFAULT_LOG_FILE = _DOT_FOLDER / _BURP_LOG
DEFAULT_LOG_LEVEL = LogLevel.INFO
DEFAULT_ROOT_DIRECTORY = Path('.')


def _default_target_dir(project: Project, target: Target) -> Path:
    return _DOT_FOLDER / project.name / target.name


def _default_device_dir(project: Project, target: Target, device: Device) -> Path:
    return _default_target_dir(project, target) / device.name


def default_build_log(project: Project, target: Target) -> Path:
    return _default_target_dir(project, target) / _BUILD_LOG


def default_flash_log(project: Project, target: Target, device: Device) -> Path:
    return _default_device_dir(project, target, device) / _FLASH_LOG


def default_monitor_log(project: Project, target: Target, device: Device) -> Path:
    return _default_device_dir(project, target, device) / _MONITOR_LOG
