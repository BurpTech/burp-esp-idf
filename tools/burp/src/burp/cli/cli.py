import logging
from asyncio import run
from importlib import metadata
from pathlib import Path

import click
from injector import Injector

from burp.check_devices.check_devices import CheckDevices
from burp.device_command.device_command import Flash
from burp.injector.burp_module import BurpModule
from burp.logger.logging_context import LogLevel, LoggingContext
from burp.monitor.monitor import Monitor
from burp.serve.serve import Serve
from burp.target_command.target_command import FullClean, Clean, Build

_LOGGER = logging.getLogger(__name__)

_DEFAULT_CONFIG_FILE = Path('burp.yml')
_DEFAULT_LOG_LEVEL = LogLevel.INFO
_DEFAULT_DEVICE_FILTER = ''
_DEFAULT_ROOT_DIRECTORY = Path('.')
_DEFAULT_OUTPUT_DIRECTORY = Path('.burp')
_DEFAULT_HTTP_PORT = 8080


@click.group(help='Tools for developing on multiple burp devices')
@click.version_option(version=metadata.version('burp'), prog_name='burp')
@click.option('-r', '--root-directory',
              help='Path to the Burp project root directory',
              show_default=True,
              type=click.Path(exists=True, file_okay=False, resolve_path=True, path_type=Path),
              default=_DEFAULT_ROOT_DIRECTORY)
@click.option('-c', '--config-file',
              help='Path to the config file',
              show_default=True,
              type=click.Path(exists=True, dir_okay=False, resolve_path=True, path_type=Path),
              default=_DEFAULT_CONFIG_FILE)
@click.option('-o', '--output-directory',
              help='Path to the output directory for logs',
              show_default=True,
              type=click.Path(file_okay=False, resolve_path=True, path_type=Path),
              default=_DEFAULT_OUTPUT_DIRECTORY)
@click.option('-l', '--log-level',
              help=u'The log level',
              show_default=True,
              type=click.Choice([e.value for e in LogLevel]),
              default=_DEFAULT_LOG_LEVEL.value)
@click.option('-f', '--device-filter',
              help=u'If specified, only devices with names containing any of the given strings will be targeted',
              default=_DEFAULT_DEVICE_FILTER)
@click.pass_context
def cli(ctx: click.Context,
        config_file: Path,
        root_directory: Path,
        output_directory,
        log_level: str,
        device_filter: str) -> None:
    injector = Injector([BurpModule(
        root_directory=root_directory,
        config_file=config_file,
        output_directory=output_directory,
        device_filter=device_filter,
    )])
    logging_context = injector.get(LoggingContext)
    logging_context.setup(log_level)
    _LOGGER.debug('root_directory: %s', root_directory)
    _LOGGER.debug('config_file: %s', config_file)
    _LOGGER.debug('output_directory: %s', output_directory)
    _LOGGER.debug('device_filter: %s', device_filter)
    ctx.obj = injector


@click.command(help='Build the projects required by the configured burp devices.')
@click.pass_context
def build(ctx: click.Context) -> None:
    injector = ctx.obj
    run(injector.get(Build).start())


@click.command(help='Clean the projects required by the configured burp devices.')
@click.pass_context
def clean(ctx: click.Context) -> None:
    injector = ctx.obj
    run(injector.get(Clean).start())


@click.command(help='Perform a full clean on the projects required by the configured burp devices.')
@click.pass_context
def full_clean(ctx: click.Context) -> None:
    injector = ctx.obj
    run(injector.get(FullClean).start())


@click.command(help='Flash the configured burp devices.')
@click.pass_context
def flash(ctx: click.Context) -> None:
    injector = ctx.obj
    run(injector.get(Flash).start())


@click.command(help='Start monitoring the configured burp devices.')
@click.pass_context
def monitor(ctx: click.Context) -> None:
    injector = ctx.obj
    run(injector.get(Monitor).start())


@click.command(help='Serve a web app for managing the configured burp devices.')
@click.option('-p', '--port',
              help='Port on which to serve the web app',
              show_default=True,
              type=click.INT,
              default=_DEFAULT_HTTP_PORT)
@click.pass_context
def serve(ctx: click.Context, port: int) -> None:
    injector = ctx.obj
    injector.get(Serve).start(
        port=port,
    )


@click.command(help='Check the connected devices.')
@click.pass_context
def check_devices(ctx: click.Context) -> None:
    injector = ctx.obj
    injector.get(CheckDevices).start()


cli.add_command(build)
cli.add_command(clean)
cli.add_command(full_clean)
cli.add_command(flash)
cli.add_command(monitor)
cli.add_command(serve)
cli.add_command(check_devices)
