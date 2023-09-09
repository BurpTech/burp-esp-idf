import asyncio
import logging
import sys
from importlib import metadata
from pathlib import Path

import click
from injector import Injector

from burp.cli.cli_module import CLIModule
from burp.command import DeviceCommand, TargetCommand
from burp.defaults import DEFAULT_CONFIG_FILE, DEFAULT_LOG_FILE, DEFAULT_LOG_LEVEL, LogLevel, DEFAULT_ROOT_DIRECTORY
from burp.params import BUILD, CLEAN, FULL_CLEAN, FLASH, MONITOR

_LOGGER = logging.getLogger(__name__)


def _setup_logger(log_level: str, log_file: Path) -> None:
    logger = logging.getLogger()
    logger.setLevel(log_level)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(logging.Formatter('%(asctime)s: %(levelname)s: %(name)s: %(message)s'))
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(logging.Formatter('%(levelname)s: %(name)s: %(message)s'))
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
@click.option('-f', '--log-file',
              help=u'Path to the log file',
              show_default=True,
              type=click.Path(dir_okay=False, writable=True, resolve_path=True, path_type=Path),
              default=DEFAULT_LOG_FILE)
@click.option('-l', '--log-level',
              help=u'The log level',
              show_default=True,
              type=click.Choice([e.value for e in LogLevel]),
              default=DEFAULT_LOG_LEVEL.value)
@click.pass_context
def cli(ctx: click.Context,
        config_file: Path,
        root_directory: Path,
        log_file: Path,
        log_level: str) -> None:
    _setup_logger(log_level, log_file)
    _LOGGER.debug('config_file: %s', config_file)
    ctx.obj = CLIModule(
        root_directory=root_directory,
        config_file=config_file,
    )


@click.command(help='Build the projects required by the configured burp devices')
@click.pass_context
def build(ctx: click.Context) -> None:
    module = ctx.obj
    injector = Injector([module])
    asyncio.run(injector.get(TargetCommand).start(BUILD))


@click.command(help='Clean the projects required by the configured burp devices')
@click.pass_context
def clean(ctx: click.Context) -> None:
    module = ctx.obj
    injector = Injector([module])
    asyncio.run(injector.get(TargetCommand).start(CLEAN))


@click.command(help='Perform a full clean on the projects required by the configured burp devices')
@click.pass_context
def fullclean(ctx: click.Context) -> None:
    module = ctx.obj
    injector = Injector([module])
    asyncio.run(injector.get(TargetCommand).start(FULL_CLEAN))


@click.command(help='Flash the configured burp devices')
@click.pass_context
def flash(ctx: click.Context) -> None:
    module = ctx.obj
    injector = Injector([module])
    asyncio.run(injector.get(DeviceCommand).start(FLASH))


@click.command(help='Start monitoring the configured burp devices')
@click.pass_context
def monitor(ctx: click.Context) -> None:
    module = ctx.obj
    injector = Injector([module])
    asyncio.run(injector.get(DeviceCommand).start(MONITOR))


cli.add_command(build)
cli.add_command(clean)
cli.add_command(fullclean)
cli.add_command(flash)
cli.add_command(monitor)
