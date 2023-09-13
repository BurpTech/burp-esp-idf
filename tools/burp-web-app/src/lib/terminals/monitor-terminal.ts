import {Terminal} from "xterm";
import {green, red} from "../colors";
import {Device} from "../Device";
import websocketRoot from "./websocket-root";

let base64 = require('base-64');

enum ReceiveEvent {
  DATA_RECEIVED = 'DATA_RECEIVED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  CONNECTION_MADE = 'CONNECTION_MADE',
}

enum SendEvent {
  DATA = 'DATA',
}

export function createMonitorTerminal(device: Device): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  const ws = new WebSocket(websocketRoot() + `/monitor/${device.name}`)
  terminal.onData(data => ws.send(JSON.stringify({
    event: SendEvent.DATA,
    data: base64.encode(data),
  })));
  ws.onmessage = event => {
    const monitor_event = JSON.parse(event.data);
    switch (monitor_event.event) {
      case ReceiveEvent.CONNECTION_MADE:
        terminal.writeln(green('BurpView: MonitorView: Connection made'));
        break;
      case ReceiveEvent.CONNECTION_LOST:
        terminal.writeln(red('BurpView: MonitorView: Connection lost'));
        break;
      case ReceiveEvent.DATA_RECEIVED:
        const data = monitor_event.data
        terminal.write(base64.decode(data));
        break;
    }
  }
  return terminal;
}

export interface MonitorTerminal {
  device: Device;
  terminal: Terminal;
}

export function createMonitorTerminals(devices: Device[]): MonitorTerminal[] {
  return devices.map(device => ({
    device,
    terminal: createMonitorTerminal(device),
  }));
}

export function getMonitorTerminal(device: Device, monitorTerminals: MonitorTerminal[]): Terminal {
  for (const monitorTerminal of monitorTerminals) {
    if (monitorTerminal.device.name === device.name) {
      return monitorTerminal.terminal
    }
  }
  throw new Error(`Unknown device: ${device.name}`)
}