import {Terminal} from "xterm";
import {green, red} from "./colors";
import {Device} from "./Device";

let base64 = require('base-64');

enum Event {
  DATA_RECEIVED = 'DATA_RECEIVED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  CONNECTION_MADE = 'CONNECTION_MADE',
}

export function connectMonitorTerminal(terminal: Terminal, device: Device): WebSocket {
  const ws = new WebSocket(`ws://localhost:8080/monitor/${device.name}`)
  ws.onmessage = event => {
    const monitor_event = JSON.parse(event.data);
    switch (monitor_event.event) {
      case Event.CONNECTION_MADE:
        terminal.writeln(green('Burp: Monitor: Connection made'));
        break;
      case Event.CONNECTION_LOST:
        terminal.writeln(red('Burp: Monitor: Connection lost'));
        break;
      case Event.DATA_RECEIVED:
        const data = monitor_event.data
        terminal.write(base64.decode(data));
        break;
    }
  }
  return ws;
}