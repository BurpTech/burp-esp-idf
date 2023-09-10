from pathlib import Path
from typing import NewType

import yaml
from injector import Module, singleton, provider

RootDirectory = NewType('RootDirectory', Path)
OutputDirectory = NewType('OutputDirectory', Path)
ConfigDict = NewType('ConfigDict', dict)


class BurpModule(Module):
    def __init__(self,
                 *,
                 root_directory: Path,
                 config_file: Path,
                 output_directory):
        self._root_directory = root_directory
        self._config_file = config_file
        self._output_directory = output_directory

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
