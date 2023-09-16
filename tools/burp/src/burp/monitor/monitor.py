import logging
from asyncio import gather, get_event_loop, sleep, create_task, Protocol

from injector import inject, singleton
from serial import SerialException
from serial_asyncio import SerialTransport, create_serial_connection

from burp.config.config import Config
from burp.config.data import Device
from burp.monitor.proxy import ProxySwitchboard
from burp.paths.paths import Paths, LogFile

RETRY_DELAY_SECONDS = 0.5

_LOGGER = logging.getLogger(__name__)


def _on_connection_made(device: Device):
    _LOGGER.info(f'Connection made for {device.name}')


@singleton
class Monitor:
    @inject
    def __init__(self, config: Config, paths: Paths):
        self._config = config
        self._paths = paths
        self._proxy_switchboard = ProxySwitchboard()
        self._transports: dict[Device, SerialTransport] = {}
        self._paused: dict[Device, bool] = {}
        self._running = False

    def register_proxy(self, device: Device, proxy: Protocol):
        self._get_proxy_for_device(device).register(proxy)

    def deregister_proxy(self, device: Device, proxy: Protocol):
        self._get_proxy_for_device(device).deregister(proxy)

    def _on_connection_lost(self, device: Device):
        _LOGGER.info(f'Connection lost for {device.name}')
        del self._transports[device]

    def _get_proxy_for_device(self, device: Device):
        return self._proxy_switchboard.get_proxy_for_device(
            device=device,
            on_connection_made=_on_connection_made,
            on_connection_lost=self._on_connection_lost,
            log_file_path=self._paths.device_log(device, LogFile.MONITOR_LOG),
        )

    async def _try_start_device(self, device: Device) -> SerialTransport | None:
        try:
            _LOGGER.info(f'Attempting to open connection to {device.name}')
            loop = get_event_loop()
            (transport, _) = await create_serial_connection(
                loop,
                lambda: self._get_proxy_for_device(device),
                device.port,
                baudrate=device.baudrate,
            )
            return transport
        except SerialException as error:
            _LOGGER.error(f'Error encountered opening connection to {device.name}: {error}')

    async def start_device(self, device: Device):
        # constantly check if the monitor is still connected
        # and reconnect if not
        while self._running:
            if self._transports.get(device) is None:
                paused = self._paused.get(device)
                if paused is None or not paused:
                    transport = await self._try_start_device(device)
                    if transport is not None:
                        self._transports[device] = transport
            await sleep(RETRY_DELAY_SECONDS)

    async def start(self):
        devices = self._config.get_devices()
        self._running = True
        await gather(*[create_task(self.start_device(device)) for device in devices])

    def pause_device(self, device: Device):
        self._paused[device] = True
        transport = self._transports.get(device)
        if transport is not None:
            transport.close()

    def resume_device(self, device: Device):
        self._paused[device] = False

    def stop(self):
        self._running = False
        for transport in self._transports.values():
            transport.close()
