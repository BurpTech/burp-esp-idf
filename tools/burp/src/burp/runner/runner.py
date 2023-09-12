import logging
from asyncio import create_subprocess_shell, StreamReader, TaskGroup
from asyncio.subprocess import PIPE
from pathlib import Path

from burp.runner.proxy import Proxy

_LOGGER = logging.getLogger(__name__)
_BUFFER_SIZE = 1024


class Runner:
    def __init__(self, cwd: Path, cmd: str, proxy: Proxy):
        self._cwd = cwd
        self._cmd = cmd
        self._proxy = proxy

    async def _stream_stdout(self, stdout: StreamReader):
        while True:
            if stdout.at_eof():
                break
            data = await stdout.read(_BUFFER_SIZE)
            self._proxy.receive_stdout(data)

    async def _stream_stderr(self, stderr: StreamReader):
        while True:
            if stderr.at_eof():
                break
            data = await stderr.read(_BUFFER_SIZE)
            self._proxy.receive_stderr(data)

    async def shell(self) -> bool:
        _LOGGER.info(f"start: {self._cwd}: {self._cmd}")
        process = await create_subprocess_shell(
            cwd=self._cwd,
            cmd=self._cmd,
            stdout=PIPE,
            stderr=PIPE,
            stdin=PIPE,
        )
        self._proxy.start(process.stdin)
        async with TaskGroup() as task_group:
            task_group.create_task(self._stream_stdout(process.stdout)),
            task_group.create_task(self._stream_stderr(process.stderr)),
        code = await process.wait()
        self._proxy.complete(code)
        end_msg = f'end [{code}]: {self._cwd}: {self._cmd}'
        if code == 0:
            _LOGGER.info(end_msg)
        else:
            _LOGGER.error(end_msg)
        return code == 0
