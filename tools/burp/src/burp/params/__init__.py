from burp.config import Target, Device, Project
from burp.defaults import default_build_log, default_flash_log, default_monitor_log


class TargetParams:
    def __init__(self, cmd: str):
        self.command = cmd

    def log_file_path(self, project: Project, target: Target):
        raise NotImplementedError()


class _BuildParams(TargetParams):
    def __init__(self):
        super().__init__('build')

    def log_file_path(self, project: Project, target: Target):
        if target.build_log is None:
            return default_build_log(project, target)
        return target.build_log


class _CleanParams(TargetParams):
    def __init__(self):
        super().__init__('clean')

    def log_file_path(self, project: Project, target: Target):
        if target.build_log is None:
            return default_build_log(project, target)
        return target.build_log


class _FullCleanParams(TargetParams):
    def __init__(self):
        super().__init__('fullclean')

    def log_file_path(self, project: Project, target: Target):
        if target.build_log is None:
            return default_build_log(project, target)
        return target.build_log


class DeviceParams:
    def __init__(self, cmd: str, build_first: bool):
        self.command = cmd
        self.build_first = build_first

    def log_file_path(self, project: Project, target: Target, device: Device):
        raise NotImplementedError()


class _FlashParams(DeviceParams):
    def __init__(self):
        super().__init__('flash', True)

    def log_file_path(self, project: Project, target: Target, device: Device):
        if device.flash_log is None:
            return default_flash_log(project, target, device)
        return device.flash_log


class _MonitorParams(DeviceParams):
    def __init__(self):
        super().__init__('monitor', False)

    def log_file_path(self, project: Project, target: Target, device: Device):
        if device.monitor_log is None:
            return default_monitor_log(project, target, device)
        return device.monitor_log


BUILD = _BuildParams()
CLEAN = _CleanParams()
FULL_CLEAN = _FullCleanParams()
FLASH = _FlashParams()
MONITOR = _MonitorParams()
