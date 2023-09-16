import logging
from asyncio import StreamWriter
from base64 import b64encode, b64decode
from enum import Enum

from burp.runner.proxy import Proxy
from burp.serve.events.invalid_event_error import InvalidEventError
from burp.serve.events.proxies.async_proxy import AsyncProxy

_LOGGER = logging.getLogger(__name__)


class _EventType(str, Enum):
    START = 'START',
    COMPLETE = 'COMPLETE',
    STDOUT = 'STDOUT',
    STDERR = 'STDERR',
    STDIN = 'STDIN',
    LOG = 'LOG',


class CommandProxy(AsyncProxy, Proxy):
    def __init__(self, context: str):
        super().__init__()
        self._context = context
        self._stdin: StreamWriter | None = None

    def start(self, stdin: StreamWriter):
        self._stdin = stdin
        self.append({
            'type': _EventType.START,
        })

    def complete(self, exit_code: int):
        if self._stdin is not None:
            self._stdin = None
        self.append({
            'type': _EventType.COMPLETE,
            'exit_code': exit_code,
        })

    def receive_stdout(self, data: bytes):
        self.append({
            'type': _EventType.STDOUT,
            'data': b64encode(data).decode(),
        })

    def receive_stderr(self, data: bytes):
        self.append({
            'type': _EventType.STDERR,
            'data': b64encode(data).decode(),
        })

    def log(self, level: str, msg: str):
        self.append({
            'type': _EventType.LOG,
            'level': level,
            'message': msg,
        })

    async def write(self, event: dict) -> None:
        match event:
            case {"type": _EventType.STDIN, "data": str(data)}:
                await self._send_data(data)
            case _:
                raise InvalidEventError(f'Invalid command event: {event}')

    async def _send_data(self, data: str):
        if self._stdin is not None:
            decoded = b64decode(data)
            _LOGGER.info(f'stdin: {self._context}: {decoded}')
            self._stdin.write(decoded)
            await self._stdin.drain()
