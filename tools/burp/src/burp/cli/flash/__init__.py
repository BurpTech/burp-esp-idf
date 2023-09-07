import logging

import click
from injector import Injector

from burp.flash import Flash

_LOGGER = logging.getLogger(__name__)


@click.command(help='Flash the configured burp devices')
@click.pass_context
def flash(ctx: click.Context) -> None:
    cli_module = ctx.obj
    injector = Injector([cli_module])
    injector.get(Flash).start()
