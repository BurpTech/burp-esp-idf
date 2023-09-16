import logging
from asyncio import Protocol
from base64 import b64encode, b64decode
from enum import Enum

from serial_asyncio import SerialTransport

from burp.serve.events.invalid_event_error import InvalidEventError
from burp.serve.events.proxies.async_proxy import AsyncProxy

_LOGGER = logging.getLogger(__name__)


class _EventType(str, Enum):
    CONNECTION_MADE = 'CONNECTION_MADE',
    CONNECTION_LOST = 'CONNECTION_LOST',
    DATA_RECEIVED = 'DATA_RECEIVED',
    DATA_SENT = 'DATA_SENT',


class MonitorProxy(AsyncProxy, Protocol):
    def __init__(self, device: str):
        super().__init__()
        self._device = device
        self._transport: SerialTransport | None = None

    def connection_made(self, transport: SerialTransport) -> None:
        self._transport = transport
        self.append({
            'type': _EventType.CONNECTION_MADE,
        })

    def connection_lost(self, exc: Exception | None) -> None:
        self._transport = None
        self.append({
            'type': _EventType.CONNECTION_LOST,
        })

    def data_received(self, data: bytes) -> None:
        self.append({
            'type': _EventType.DATA_RECEIVED,
            'data': b64encode(data).decode(),
        })

    async def write(self, event: dict):
        match event:
            case {"type": _EventType.DATA_SENT, "data": str(data)}:
                self._send_data(data)
            case _:
                raise InvalidEventError(f'Invalid monitor event: device: {self._device}: {event}')

    def _send_data(self, data: str) -> None:
        if self._transport is not None:
            decoded = b64decode(data)
            _LOGGER.info(f'data sent: {self._device}: {decoded}')
            self._transport.write(decoded)
            self._transport.flush()
