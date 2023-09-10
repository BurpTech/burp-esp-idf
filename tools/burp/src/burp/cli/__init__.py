import asyncio
import logging
import sys
from enum import Enum
from importlib import metadata
from pathlib import Path

import click
from injector import Injector

from burp.cli.burp_module import BurpModule
from burp.command import DeviceCommand, TargetCommand
from burp.idf import Command
from burp.paths import Paths, LogFile

_LOGGER = logging.getLogger(__name__)


class LogLevel(Enum):
    CRITICAL = 'CRITICAL'
    ERROR = 'ERROR'
    WARNING = 'WARNING'
    INFO = 'INFO'
    DEBUG = 'DEBUG'


DEFAULT_CONFIG_FILE = Path('burp.yml')
DEFAULT_LOG_LEVEL = LogLevel.INFO
DEFAULT_ROOT_DIRECTORY = Path('.')
DEFAULT_OUTPUT_DIRECTORY = Path('.burp')


class StdOutFormatter(logging.Formatter):
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format = "%(name)s: %(levelname)s: %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format + reset,
        logging.INFO: grey + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: red + format + reset,
        logging.CRITICAL: bold_red + format + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


def _setup_logger(log_level: str, log_file: Path) -> None:
    logger = logging.getLogger()
    logger.setLevel(log_level)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s: %(name)s: %(levelname)s: %(message)s (%(filename)s:%(lineno)d)'
    ))
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(StdOutFormatter())
    logger.addHandler(file_handler)
    logger.addHandler(stdout_handler)


@click.group(help='Tools for developing on multiple burp devices')
@click.version_option(version=metadata.version('burp'), prog_name='burp')
@click.option('-r', '--root-directory',
              help='Path to the Burp project root directory',
              show_default=True,
              type=click.Path(exists=True, file_okay=False, resolve_path=True, path_type=Path),
              default=DEFAULT_ROOT_DIRECTORY)
@click.option('-c', '--config-file',
              help='Path to the config file',
              show_default=True,
              type=click.Path(exists=True, dir_okay=False, resolve_path=True, path_type=Path),
              default=DEFAULT_CONFIG_FILE)
@click.option('-o', '--output-directory',
              help='Path to the output directory for logs',
              show_default=True,
              type=click.Path(file_okay=False, resolve_path=True, path_type=Path),
              default=DEFAULT_OUTPUT_DIRECTORY)
@click.option('-l', '--log-level',
              help=u'The log level',
              show_default=True,
              type=click.Choice([e.value for e in LogLevel]),
              default=DEFAULT_LOG_LEVEL.value)
@click.pass_context
def cli(ctx: click.Context,
        config_file: Path,
        root_directory: Path,
        output_directory,
        log_level: str) -> None:
    injector = Injector([BurpModule(
        root_directory=root_directory,
        config_file=config_file,
        output_directory=output_directory,
    )])
    paths = injector.get(Paths)
    _setup_logger(log_level, paths.burp_log())
    _LOGGER.debug('config_file: %s', config_file)
    ctx.obj = injector


@click.command(help='Build the projects required by the configured burp devices. '
                    'If specified, only devices with names containing any of the given strings will be targeted.')
@click.argument('devices', nargs=-1)
@click.pass_context
def build(ctx: click.Context, devices: tuple[str, ...]) -> None:
    injector = ctx.obj
    asyncio.run(injector.get(TargetCommand).start(
        command=Command.BUILD,
        log_file=LogFile.BUILD_LOG,
        devices=devices,
    ))


@click.command(help='Clean the projects required by the configured burp devices. '
                    'If specified, only devices with names containing any of the given strings will be targeted.')
@click.argument('devices', nargs=-1)
@click.pass_context
def clean(ctx: click.Context, devices: tuple[str, ...]) -> None:
    injector = ctx.obj
    asyncio.run(injector.get(TargetCommand).start(
        command=Command.CLEAN,
        log_file=LogFile.BUILD_LOG,
        devices=devices,
    ))


@click.command(help='Perform a full clean on the projects required by the configured burp devices. '
                    'If specified, only devices with names containing any of the given strings will be targeted.')
@click.argument('devices', nargs=-1)
@click.pass_context
def fullclean(ctx: click.Context, devices: tuple[str, ...]) -> None:
    injector = ctx.obj
    asyncio.run(injector.get(TargetCommand).start(
        command=Command.FULL_CLEAN,
        log_file=LogFile.BUILD_LOG,
        devices=devices,
    ))


@click.command(help='Flash the configured burp devices. '
                    'If specified, only devices with names containing any of the given strings will be targeted.')
@click.argument('devices', nargs=-1)
@click.pass_context
def flash(ctx: click.Context, devices: tuple[str, ...]) -> None:
    injector = ctx.obj
    asyncio.run(injector.get(DeviceCommand).start(
        command=Command.FLASH,
        log_file=LogFile.FLASH_LOG,
        build_first=True,
        devices=devices,
    ))


@click.command(help='Start monitoring the configured burp devices. '
                    'If specified, only devices with names containing any of the given strings will be targeted.')
@click.argument('devices', nargs=-1)
@click.pass_context
def monitor(ctx: click.Context, devices: tuple[str, ...]) -> None:
    injector = ctx.obj
    asyncio.run(injector.get(DeviceCommand).start(
        command=Command.MONITOR,
        log_file=LogFile.MONITOR_LOG,
        build_first=False,
        devices=devices,
    ))


cli.add_command(build)
cli.add_command(clean)
cli.add_command(fullclean)
cli.add_command(flash)
cli.add_command(monitor)
