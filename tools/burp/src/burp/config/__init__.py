import logging
from dataclasses import dataclass
from pathlib import Path

_LOGGER = logging.getLogger(__name__)


class ConfigError(Exception):
    pass


def _get_path_or_none(context: str, d: dict, k: str) -> Path | None:
    try:
        v = d[k]
        if isinstance(v, str):
            return Path(v)
        raise ConfigError(f'{k} field should be a string: {context}')
    except KeyError:
        return None


@dataclass(frozen=True)
class Device:
    name: str
    port: str
    flash_log: Path | None = None
    monitor_log: Path | None = None


def _device_from_dict_or_str(project_name: str, target_name: str, device_name: str, device: dict | str) -> Device:
    if isinstance(device, str):
        return Device(
            name=device_name,
            port=device
        )
    context = f'{project_name} / {target_name} / {device_name}'
    if isinstance(device, dict):
        try:
            port = device['port']
        except KeyError:
            raise ConfigError(f'No port specified for device: {context}')
        return Device(
            name=device_name,
            port=port,
            flash_log=_get_path_or_none(context, device, 'flash_log'),
            monitor_log=_get_path_or_none(context, device, 'monitor_log'),
        )
    raise ConfigError(f'Device config should be a string or dictionary: {context}')


@dataclass(frozen=True)
class Target:
    name: str
    devices: tuple[Device]
    build_log: Path | None = None


def _target_from_dict(project_name, target_name, target) -> Target:
    context = f'{project_name} / {target_name}'
    if isinstance(target, dict):
        return Target(
            name=target_name,
            build_log=_get_path_or_none(context, target, 'build_log'),
            devices=tuple(_device_from_dict_or_str(
                project_name,
                target_name,
                device_name,
                device,
            ) for (device_name, device) in target.get('devices', []).items())
        )
    raise ConfigError(f'Target config should be a dictionary: {context}')


@dataclass(frozen=True)
class Project:
    name: str
    targets: tuple[Target]


def _project_from_dict(project_name, project) -> Project:
    if isinstance(project, dict):
        return Project(
            name=project_name,
            targets=tuple(_target_from_dict(
                project_name,
                target_name,
                target,
            ) for (target_name, target) in project.items())
        )
    raise ConfigError(f'Project config should be a dictionary: {project_name}')


@dataclass(frozen=True)
class Config:
    projects: tuple[Project]


def config_from_dict(config: dict) -> Config:
    _LOGGER.debug(config)
    if isinstance(config, dict):
        return Config(
            projects=tuple(_project_from_dict(
                project_name,
                project,
            ) for (project_name, project) in config.items()),
        )
    raise ConfigError(f'Config should be a dictionary')
