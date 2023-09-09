from pathlib import Path
from typing import NewType

import yaml
from injector import Module, singleton, provider

from burp.config import Config, config_from_dict

RootDirectory = NewType('RootDirectory', Path)


class CLIModule(Module):
    def __init__(self,
                 *,
                 root_directory: Path,
                 config_file: Path):
        self._root_directory = root_directory
        self._config_file = config_file

    @singleton
    @provider
    def provide_root_directory(self) -> RootDirectory:
        return RootDirectory(self._root_directory)

    @singleton
    @provider
    def provide_config(self) -> Config:
        config = yaml.safe_load(self._config_file.read_text())
        return config_from_dict(config)
