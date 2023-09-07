import logging

import click
from injector import Injector

from burp.build import Build

_LOGGER = logging.getLogger(__name__)


@click.command(help='Build the projects required by the configured burp devices')
@click.pass_context
def build(ctx: click.Context) -> None:
    cli_module = ctx.obj
    injector = Injector([cli_module])
    injector.get(Build).start()
