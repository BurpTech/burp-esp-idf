from asyncio import Protocol
from io import BufferedIOBase
from pathlib import Path
from typing import Callable

from serial_asyncio import SerialTransport

from burp.config.data import Device


class LoggingProxy(Protocol):
    def __init__(self, log_file_path: Path):
        self._log_file_path = log_file_path
        self._log_file: BufferedIOBase | None = None

    def connection_made(self, transport: SerialTransport):
        self._log_file = self._log_file_path.open('ab')

    def connection_lost(self, exc: Exception | None):
        self._log_file.close()

    def data_received(self, data: bytes):
        self._log_file.write(data)
        self._log_file.flush()


class MultiProxy(Protocol):
    def __init__(self, proxies: list[Protocol, ...]):
        self._proxies = proxies

    def register(self, proxy: Protocol):
        self._proxies.append(proxy)

    def deregister(self, proxy: Protocol):
        self._proxies.remove(proxy)

    def connection_made(self, transport: SerialTransport):
        for proxy in self._proxies:
            proxy.connection_made(transport)

    def connection_lost(self, exc: Exception | None):
        for proxy in self._proxies:
            proxy.connection_lost(exc)

    def data_received(self, data: bytes):
        for proxy in self._proxies:
            proxy.data_received(data)


class CallbackProxy(Protocol):
    def __init__(self,
                 device: Device,
                 on_connection_made: Callable[[Device], None],
                 on_connection_lost: Callable[[Device], None]):
        self._device = device
        self._on_connection_made = on_connection_made
        self._on_connection_lost = on_connection_lost

    def connection_made(self, transport: SerialTransport):
        self._on_connection_made(self._device)

    def connection_lost(self, exc: Exception | None):
        self._on_connection_lost(self._device)


class ProxySwitchboard:
    def __init__(self):
        self._switch_board: dict[Device, MultiProxy] = {}

    def get_proxy_for_device(self,
                             device: Device,
                             on_connection_made: Callable[[Device], None],
                             on_connection_lost: Callable[[Device], None],
                             log_file_path: Path) -> MultiProxy:
        return self._switch_board.setdefault(device, MultiProxy([
            CallbackProxy(device, on_connection_made, on_connection_lost),
            LoggingProxy(log_file_path),
        ]))
