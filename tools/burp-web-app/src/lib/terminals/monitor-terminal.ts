import {Terminal} from "xterm";
import {green, red} from "../colors";
import {Device} from "../Device";
import {DeviceMonitor, DeviceMonitorDataReceivedEvent, EventType} from "../websocket/DeviceMonitor";

export function createMonitorTerminal(deviceMonitor: DeviceMonitor): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  terminal.onData(data => deviceMonitor.sendData(data));
  deviceMonitor.addEventListener(EventType.CONNECTION_MADE, () => {
    terminal.writeln(green('BurpView: MonitorView: Connection made'));
  });
  deviceMonitor.addEventListener(EventType.CONNECTION_LOST, () => {
    terminal.writeln(red('BurpView: MonitorView: Connection lost'));
  });
  deviceMonitor.addEventListener(EventType.DATA_RECEIVED, event => {
    const deviceMonitorDataReceivedEvent = event as DeviceMonitorDataReceivedEvent;
    terminal.write(deviceMonitorDataReceivedEvent.data);
  });
  return terminal;
}

export interface MonitorTerminal {
  deviceMonitor: DeviceMonitor;
  terminal: Terminal;
}

export function createMonitorTerminals(deviceMonitors: DeviceMonitor[]): MonitorTerminal[] {
  return deviceMonitors.map(deviceMonitor => ({
    deviceMonitor,
    terminal: createMonitorTerminal(deviceMonitor),
  }));
}

export function getMonitorTerminal(device: Device, monitorTerminals: MonitorTerminal[]): Terminal {
  for (const monitorTerminal of monitorTerminals) {
    if (monitorTerminal.deviceMonitor.device.name === device.name) {
      return monitorTerminal.terminal
    }
  }
  throw new Error(`Unknown device: ${device.name}`)
}