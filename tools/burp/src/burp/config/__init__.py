import logging
from dataclasses import dataclass
from pathlib import Path

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class Device:
    name: str
    port: Path
    build_log: Path
    flash_log: Path
    monitor_log: Path


@dataclass(frozen=True)
class Target:
    name: str
    devices: tuple[Device]


@dataclass(frozen=True)
class Project:
    name: str
    targets: tuple[Target]


@dataclass(frozen=True)
class Config:
    projects: tuple[Project]


def from_dict(config: dict) -> Config:
    _LOGGER.info(config)
    return Config(
        projects=tuple(Project(
            name,
            targets=tuple(Target(
                name,
                devices=tuple(Device(
                    name,
                    port=device['port'],
                    build_log=device['build_log'],
                    flash_log=device['flash_log'],
                    monitor_log=device['monitor_log'],
                ) for (name, device) in target.items())
            ) for (name, target) in project.items())
        ) for (name, project) in config['burp'].items())
    )
