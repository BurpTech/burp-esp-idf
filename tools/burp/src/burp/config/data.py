from dataclasses import dataclass


@dataclass(frozen=True)
class Target:
    name: str
    project: str


@dataclass(frozen=True)
class Device:
    name: str
    port: str
    baudrate: int
    target: Target
