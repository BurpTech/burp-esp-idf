from pathlib import Path

import yaml
from injector import Module, singleton, provider

from burp.config import Config, from_dict


class CLIModule(Module):
    def __init__(self,
                 config_file: Path):
        self._config_file = config_file

    @singleton
    @provider
    def provide_config(self) -> Config:
        config = yaml.safe_load(self._config_file.read_text())
        return from_dict(config)
