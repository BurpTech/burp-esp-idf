import logging

import click
from injector import Injector

from burp.monitor import Monitor

_LOGGER = logging.getLogger(__name__)


@click.command(help='Start monitoring the configured burp devices')
@click.pass_context
def monitor(ctx: click.Context) -> None:
    cli_module = ctx.obj
    injector = Injector([cli_module])
    injector.get(Monitor).start()
