from pathlib import Path
from typing import NewType

from burp.serve.events.proxies.command_proxy import CommandProxy
from burp.serve.events.proxies.monitor_proxy import MonitorProxy

RootDirectory = NewType('RootDirectory', Path)
OutputDirectory = NewType('OutputDirectory', Path)
DeviceFilter = NewType('DeviceFilter', tuple[str, ...])
ConfigDict = NewType('ConfigDict', dict)
MonitorProxies = NewType('MonitorProxies', dict[str, MonitorProxy])
DeviceCommandProxies = NewType('DeviceCommandProxies', dict[str, CommandProxy])
TargetCommandProxies = NewType('TargetCommandProxies', dict[str, CommandProxy])
