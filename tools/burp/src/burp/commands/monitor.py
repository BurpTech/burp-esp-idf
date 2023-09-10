import logging
from asyncio import transports, Transport, Protocol, gather, get_event_loop, sleep
from dataclasses import dataclass
from io import BufferedIOBase
from typing import Callable

import serial_asyncio
from injector import inject, ClassAssistedBuilder
from serial import SerialException

from burp.config.config import Config
from burp.config.data import Device
from burp.paths.paths import Paths, LogFile

RETRY_DELAY_SECONDS = 0.5

_LOGGER = logging.getLogger(__name__)


class MonitorProtocol(Protocol):
    @inject
    def __init__(self, paths: Paths, device: Device, on_close: Callable[[Device], None]):
        super().__init__()
        self._paths = paths
        self._device = device
        self._on_close = on_close
        self._log: BufferedIOBase | None = None

    def connection_made(self, transport: transports.BaseTransport) -> None:
        _LOGGER.info(f'Port opened for {self._device.name}')
        self._log = self._paths.device_log(self._device, LogFile.MONITOR_LOG).open('ab')

    def connection_lost(self, exc: Exception | None) -> None:
        _LOGGER.info(f'Port closed for {self._device.name}')
        if self._log is not None:
            self._log.close()
        self._on_close(self._device)

    def data_received(self, data: bytes) -> None:
        if self._log is not None:
            self._log.write(data)
            self._log.flush()


@dataclass(frozen=True)
class MonitorData:
    transport: Transport
    protocol: Protocol


class Monitor:
    @inject
    def __init__(self, config: Config, monitor_protocol_builder: ClassAssistedBuilder[MonitorProtocol]):
        self._config = config
        self._monitor_protocol_builder = monitor_protocol_builder
        self._data = dict()

    def _on_close(self, device: Device):
        del self._data[device]

    async def _try_start_device(self, device: Device) -> MonitorData | None:
        try:
            _LOGGER.info(f'Attempting to open connection to {device.name}')
            loop = get_event_loop()
            return await serial_asyncio.create_serial_connection(
                loop,
                lambda: self._monitor_protocol_builder.build(
                    device=device,
                    on_close=self._on_close
                ),
                device.port,
                baudrate=device.baudrate,
            )
        except SerialException as error:
            _LOGGER.error(f'Error encountered opening connection to {device.name}: {error}')

    async def _start_device(self, device: Device):
        # constantly check if the monitor is still connected
        # and reconnect if not
        while True:
            if self._data.get(device) is None:
                monitor_data = await self._try_start_device(device)
                if monitor_data is not None:
                    self._data[device] = monitor_data
            await sleep(RETRY_DELAY_SECONDS)

    async def start(self, devices: tuple[str, ...]):
        devices = self._config.get_devices(devices)
        await gather(*[self._start_device(device) for device in devices])
