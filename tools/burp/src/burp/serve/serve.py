import logging
from asyncio import CancelledError
from asyncio import create_task, TaskGroup
from json import dumps, loads

from injector import inject, singleton, ClassAssistedBuilder
from quart import Quart, websocket

from burp.monitor.monitor import Monitor
from burp.serve.events.event_proxy import EventProxy

_LOGGER = logging.getLogger(__name__)


@singleton
class Serve:
    @inject
    def __init__(self,
                 monitor: Monitor,
                 event_proxy_builder: ClassAssistedBuilder[EventProxy]):
        self._monitor = monitor
        self._event_proxy_builder = event_proxy_builder

    def _create_websocket(self, app: Quart):
        @app.websocket(f'/ws')
        async def ws():
            _LOGGER.info('ws')
            event_proxy = self._event_proxy_builder.build()

            async def sending():
                while True:
                    events = await event_proxy.read()
                    for event in events:
                        await websocket.send(dumps(event))

            async def receiving():
                while True:
                    data = await websocket.receive()
                    event = loads(data)
                    await event_proxy.write(event)

            try:
                async with TaskGroup() as task_group:
                    task_group.create_task(sending())
                    task_group.create_task(receiving())
                    task_group.create_task(event_proxy.connect())
            except CancelledError:
                event_proxy.disconnect()
                raise

    def start(self, port: int):
        app = Quart('burp',
                    static_url_path='',
                    static_folder='../../../burp-web-app/build')

        @app.before_serving
        async def start_monitor():
            create_task(self._monitor.start())

        @app.after_serving
        async def stop_monitor():
            self._monitor.stop()

        @app.route('/')
        async def root():
            return await app.send_static_file('index.html')

        self._create_websocket(app)

        app.run(port=port)
