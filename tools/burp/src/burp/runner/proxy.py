from io import BufferedIOBase
from pathlib import Path
from typing import TypeVar, Generic


class Proxy:
    def start(self):
        raise NotImplementedError()

    def receive_stdout(self, data: bytes):
        raise NotImplementedError()

    def receive_stderr(self, data: bytes):
        raise NotImplementedError()

    def complete(self, exit_code: int):
        raise NotImplementedError()


class LoggingProxy(Proxy):
    def __init__(self, log_file_path: Path):
        self._log_file_path = log_file_path
        self._log_file: BufferedIOBase | None = None

    def start(self):
        self._log_file = self._log_file_path.open('ab')

    def receive_stdout(self, data: bytes):
        self._log_file.write(data)
        self._log_file.flush()

    def receive_stderr(self, data: bytes):
        self._log_file.write(data)
        self._log_file.flush()

    def complete(self, exit_code: int):
        self._log_file.close()


class MultiProxy(Proxy):
    def __init__(self, proxies: list[Proxy, ...]):
        self._proxies = proxies

    def register(self, proxy: Proxy):
        self._proxies.append(proxy)

    def deregister(self, proxy: Proxy):
        self._proxies.remove(proxy)

    def start(self):
        for proxy in self._proxies:
            proxy.start()

    def receive_stdout(self, data: bytes):
        for proxy in self._proxies:
            proxy.receive_stdout(data)

    def receive_stderr(self, data: bytes):
        for proxy in self._proxies:
            proxy.receive_stderr(data)

    def complete(self, exit_code: int):
        for proxy in self._proxies:
            proxy.complete(exit_code)


T = TypeVar('T')


class ProxySwitchboard(Generic[T]):
    def __init__(self):
        self._switch_board: dict[T, MultiProxy] = {}

    def get_proxy_for_key(self, key: T) -> MultiProxy:
        return self._switch_board.setdefault(key, MultiProxy([]))
