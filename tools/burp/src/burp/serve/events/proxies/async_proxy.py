from asyncio import Future


class AsyncProxy:
    def __init__(self):
        self._ready: Future[None] = Future()
        self._events: list[dict] = []

    def append(self, event: dict):
        self._events.append(event)
        if not self._ready.done():
            self._ready.set_result(None)

    async def read(self) -> list[dict]:
        await self._ready
        self._ready = Future()
        events = self._events
        self._events = []
        return events

    async def write(self, event: dict):
        raise NotImplementedError()
