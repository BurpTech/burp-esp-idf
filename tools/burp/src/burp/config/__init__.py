import logging
from dataclasses import dataclass

_LOGGER = logging.getLogger(__name__)


class ConfigError(Exception):
    pass


@dataclass(frozen=True)
class Target:
    name: str
    project: str


@dataclass(frozen=True)
class Device:
    name: str
    port: str
    target: Target


@dataclass(frozen=True)
class TargetGroup:
    target: Target
    devices: tuple[Device, ...]


def _get_param(device_name: str, device: dict, key: str) -> str:
    try:
        param = device[key]
        if isinstance(param, str):
            return param
        raise ConfigError(f'{key} parameter should be a string: {device_name}')
    except KeyError:
        raise ConfigError(f'No {key} specified for device: {device_name}')


def _target_from_dict(device_name: str, device: dict) -> Target:
    return Target(
        name=_get_param(device_name, device, 'target'),
        project=_get_param(device_name, device, 'project'),
    )


def _device_from_dict(device_name: str, device: dict) -> Device:
    if isinstance(device, dict):
        return Device(
            name=device_name,
            port=_get_param(device_name, device, 'port'),
            target=_target_from_dict(device_name, device)
        )
    raise ConfigError(f'Device config should be a dictionary: {device_name}')


class Config:
    _devices: tuple[Device, ...]

    def __init__(self, config: dict):
        _LOGGER.debug(config)
        if isinstance(config, dict):
            self._devices = tuple(_device_from_dict(
                device_name,
                device,
            ) for (device_name, device) in config.items())
            self.check_valid()
        else:
            raise ConfigError(f'Config should be a dictionary')

    def check_valid(self):
        # check that the devices all have distinct ports
        for device in self._devices:
            port = device.port
            conflicts: tuple[Device, ...] = tuple(filter(lambda d: d.port == port, self._devices))
            if len(conflicts) > 1:
                raise ConfigError(
                    f'Port {port} assigned to multiple devices: {[conflict.name for conflict in conflicts]}'
                )

    def get_devices(self, devices: tuple[str, ...]) -> tuple[Device, ...]:
        if len(devices) == 0:
            return self._devices
        return tuple(filter(lambda device: any(name in device.name for name in devices), self._devices))

    def get_targets(self, devices: tuple[str, ...]) -> tuple[Target, ...]:
        devices = self.get_devices(devices)
        return tuple(set(device.target for device in devices))

    def get_target_groups(self, devices: tuple[str, ...]) -> tuple[TargetGroup, ...]:
        devices = self.get_devices(devices)
        targets = tuple(set(device.target for device in devices))
        return tuple(TargetGroup(
            target=target,
            devices=tuple(filter(lambda device: device.target == target, devices))
        ) for target in targets)
