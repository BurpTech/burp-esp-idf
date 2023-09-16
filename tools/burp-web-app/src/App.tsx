import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Device} from "./lib/Device";
import {createBurpTerminal} from "./lib/terminals/burp-terminal";
import {createMonitorTerminals} from "./lib/terminals/monitor-terminal";
import {createBuildTerminals, createFlashTerminals} from "./lib/terminals/command-terminal";
import Tasks from "./Tasks";
import Devices from "./Devices";
import {BurpWebSocket} from "./lib/websocket/BurpWebSocket";
import {Burp, BurpInitEvent, EventType as BurpEventType} from "./lib/websocket/Burp";
import {EventType as MonitorEventType, Monitor, MonitorDevicesEvent} from "./lib/websocket/Monitor";
import {EventType as FlashEventType, Flash, FlashDevicesEvent} from "./lib/websocket/Flash";
import {Build, BuildTargetsEvent, EventType as BuildEventType} from "./lib/websocket/Build";
import {DeviceMonitor} from "./lib/websocket/DeviceMonitor";
import {DeviceFlash} from "./lib/websocket/DeviceFlash";
import {TargetBuild} from "./lib/websocket/TargetBuild";

enum ViewMode {
  TASKS,
  DEVICES,
}

export default function App() {
  const [viewMode, setViewMode] = React.useState(ViewMode.TASKS);
  let initialDevices: Device[] = [];
  const [devices, setDevices] = useState(initialDevices);
  let initialDeviceMonitors: DeviceMonitor[] = [];
  const [deviceMonitors, setDeviceMonitors] = useState(initialDeviceMonitors);
  let initialDeviceFlashes: DeviceFlash[] = [];
  const [deviceFlashes, setDeviceFlashes] = useState(initialDeviceFlashes);
  let initialTargetBuilds: TargetBuild[] = [];
  const [targetBuilds, setTargetBuilds] = useState(initialTargetBuilds);
  const burp = useMemo(() => new Burp(), [])
  const monitor = useMemo(() => new Monitor(burp), [burp])
  const flash = useMemo(() => new Flash(burp), [burp])
  const build = useMemo(() => new Build(burp), [burp])
  const burpWebSocket = useMemo(() => new BurpWebSocket({
    burp,
    monitor,
    flash,
    build
  }), [burp, monitor, flash, build])
  const burpTerminal = useMemo(() => createBurpTerminal(burp), [burp]);
  const monitorTerminals = useMemo(() => createMonitorTerminals(deviceMonitors), [deviceMonitors]);
  const flashTerminals = useMemo(() => createFlashTerminals(deviceFlashes), [deviceFlashes]);
  const buildTerminals = useMemo(() => createBuildTerminals(targetBuilds), [targetBuilds]);

  useEffect(() => {
    const disconnect = burpWebSocket.connect()
    return () => {
      disconnect();
    }
  }, [burpWebSocket]);

  burp.addEventListener(BurpEventType.INIT, event => {
    const burpInitEvent = event as BurpInitEvent;
    setDevices(burpInitEvent.devices);
  });

  monitor.addEventListener(MonitorEventType.DEVICES, event => {
    const monitorDevicesEvent = event as MonitorDevicesEvent;
    setDeviceMonitors(monitorDevicesEvent.deviceMonitors);
  });

  flash.addEventListener(FlashEventType.DEVICES, event => {
    const flashDevicesEvent = event as FlashDevicesEvent;
    setDeviceFlashes(flashDevicesEvent.deviceFlashes);
  });

  build.addEventListener(BuildEventType.TARGETS, event => {
    const buildTargetsEvent = event as BuildTargetsEvent;
    setTargetBuilds(buildTargetsEvent.targetBuilds);
  });

  switch (viewMode) {
    case ViewMode.TASKS:
      return <Tasks setViewModeDevices={() => setViewMode(ViewMode.DEVICES)}
                    burp={burp}
                    burpTerminal={burpTerminal}
                    monitorTerminals={monitorTerminals}
                    flashTerminals={flashTerminals}
                    buildTerminals={buildTerminals}/>
    case ViewMode.DEVICES:
      return <Devices setViewModeTasks={() => setViewMode(ViewMode.TASKS)}
                      devices={devices}
                      burp={burp}
                      burpTerminal={burpTerminal}
                      monitorTerminals={monitorTerminals}
                      flashTerminals={flashTerminals}
                      buildTerminals={buildTerminals}/>
  }
}