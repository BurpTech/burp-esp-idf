from logging import Handler, LogRecord

from injector import singleton


class Proxy:
    def receive(self, line: str):
        pass


@singleton
class ProxyHandler(Handler):
    def __init__(self):
        super().__init__()
        self._proxies: list[Proxy] = []

    def register(self, proxy: Proxy):
        self._proxies.append(proxy)

    def deregister(self, proxy: Proxy):
        self._proxies.remove(proxy)

    def emit(self, record: LogRecord) -> None:
        message = self.format(record)
        for proxy in self._proxies:
            proxy.receive(message)
