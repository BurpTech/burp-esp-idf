import sys
from logging import FileHandler, Formatter, StreamHandler
from pathlib import Path

import yaml
from injector import Module, singleton, provider, multiprovider

from burp.config.config import Config
from burp.injector.burp_types import RootDirectory, OutputDirectory, ConfigDict, DeviceCommandProxies, \
    TargetCommandProxies, DeviceFilter, MonitorProxies
from burp.logger.color_formatter import ColorFormatter
from burp.logger.proxy_handler import ProxyHandler
from burp.paths.paths import Paths
from burp.serve.events.proxies.command_proxy import CommandProxy
from burp.serve.events.proxies.monitor_proxy import MonitorProxy


class BurpModule(Module):
    def __init__(self,
                 *,
                 root_directory: Path,
                 config_file: Path,
                 output_directory: Path,
                 device_filter: str):
        self._root_directory = root_directory
        self._config_file = config_file
        self._output_directory = output_directory
        self._device_filter = device_filter

    @singleton
    @provider
    def provide_root_directory(self) -> RootDirectory:
        return RootDirectory(self._root_directory)

    @singleton
    @provider
    def provide_config_dict(self) -> ConfigDict:
        return yaml.safe_load(self._config_file.read_text())

    @singleton
    @provider
    def provide_output_directory(self) -> OutputDirectory:
        return OutputDirectory(self._output_directory)

    @singleton
    @provider
    def provide_device_filter(self) -> DeviceFilter:
        return DeviceFilter(tuple(self._device_filter.split()))

    @singleton
    @provider
    def provide_logging_file_handler(self, paths: Paths) -> FileHandler:
        log_file = paths.burp_log()
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = FileHandler(log_file)
        file_handler.setFormatter(Formatter(
            '%(asctime)s: %(name)s: %(levelname)s: %(message)s (%(filename)s:%(lineno)d)'
        ))
        return file_handler

    @singleton
    @provider
    def provide_logging_stdout_handler(self, color_formatter: ColorFormatter) -> StreamHandler:
        stdout_handler = StreamHandler(sys.stdout)
        stdout_handler.setFormatter(color_formatter)
        return stdout_handler

    @singleton
    @provider
    def provide_logging_proxy_handler(self, color_formatter: ColorFormatter) -> ProxyHandler:
        proxy_handler = ProxyHandler()
        proxy_handler.setFormatter(color_formatter)
        return proxy_handler

    @multiprovider
    def provide_monitor_proxies(self, config: Config) -> MonitorProxies:
        return MonitorProxies({
            device.name: MonitorProxy(device.name)
            for device in config.get_devices()
        })

    @multiprovider
    def provide_device_command_proxies(self, config: Config) -> DeviceCommandProxies:
        return DeviceCommandProxies({
            device.name: CommandProxy(device.name)
            for device in config.get_devices()
        })

    @multiprovider
    def provide_target_command_proxies(self, config: Config) -> TargetCommandProxies:
        return TargetCommandProxies({
            target.name: CommandProxy(target.name)
            for target in config.get_targets()
        })
