import logging
from importlib import metadata
from pathlib import Path

import click

from burp.cli.build import build
from burp.cli.cli_module import CLIModule
from burp.cli.flash import flash
from burp.cli.monitor import monitor

_DOT_FOLDER = Path('.burp')
_LOG_FILE = Path('burp.log')

_DEFAULT_CONFIG_FILE: Path = Path('burp.yml')
_DEFAULT_LOG_FILE: Path = _DOT_FOLDER / _LOG_FILE
_DEFAULT_LOG_LEVEL: str = 'INFO'

_LOG_LEVELS = ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']

_LOGGER = logging.getLogger(__name__)


def _setup_logger(log_level: str, log_file: Path) -> None:
    logger = logging.getLogger()
    logger.setLevel(log_level)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(log_file)
    handler.setFormatter(logging.Formatter('%(asctime)s: %(levelname)s: %(name)s: %(message)s'))
    logger.addHandler(handler)


@click.group(help='Tools for developing on multiple burp devices')
@click.version_option(version=metadata.version('burp'), prog_name='burp')
@click.option('-c', '--config-file',
              help='Path to the config file',
              show_default=True,
              type=click.Path(dir_okay=False, resolve_path=True, path_type=Path),
              default=_DEFAULT_CONFIG_FILE)
@click.option('-f', '--log-file',
              help=u'Path to the log file',
              show_default=True,
              type=click.Path(dir_okay=False, writable=True, resolve_path=True, path_type=Path),
              default=_DEFAULT_LOG_FILE)
@click.option('-l', '--log-level',
              help=u'The log level',
              show_default=True,
              type=click.Choice(_LOG_LEVELS),
              default=_DEFAULT_LOG_LEVEL)
@click.pass_context
def cli(ctx: click.Context,
        config_file: Path,
        log_file: Path,
        log_level: str) -> None:
    _setup_logger(log_level, log_file)
    _LOGGER.info('config_file: %s', config_file)
    ctx.obj = CLIModule(
        config_file=config_file,
    )


cli.add_command(build)
cli.add_command(flash)
cli.add_command(monitor)
