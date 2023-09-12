import {Terminal} from "xterm";
import {green, red, yellow} from "../colors";
import {Target} from "../Target";
import {Device} from "../Device";

let base64 = require('base-64');

enum ReceiveEvent {
  START = 'START',
  COMPLETE = 'COMPLETE',
  STDOUT = 'STDOUT',
  STDERR = 'STDERR',
  LOG = 'LOG',
}

enum LogLevel {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

enum SendEvent {
  DATA = 'DATA',
}

function getLogColor(level: string): (text: string) => string {
  switch (level) {
    case LogLevel.CRITICAL:
      return red;
    case LogLevel.ERROR:
      return red;
    case LogLevel.WARNING:
      return yellow;
    case LogLevel.INFO:
      return green;
    case LogLevel.DEBUG:
      return text => text;
    default:
      return text => text;
  }
}

function createCommandTerminal(endpoint: string, context: string): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  const ws = new WebSocket(`ws://localhost:8080/${endpoint}`)
  terminal.onData((data) => ws.send(JSON.stringify({
    event: SendEvent.DATA,
    data: base64.encode(data),
  })));
  ws.onmessage = event => {
    const flash_event = JSON.parse(event.data);
    switch (flash_event.event) {
      case ReceiveEvent.START:
        terminal.writeln(green(`Burp: ${context}: Start`));
        break;
      case ReceiveEvent.COMPLETE:
        const exit_code = flash_event.exit_code;
        const color = exit_code === 0 ? green : red;
        terminal.writeln(color(`Burp: ${context}: Complete: exit code: ${exit_code}`));
        break;
      case ReceiveEvent.STDOUT:
      case ReceiveEvent.STDERR:
        const data = flash_event.data
        terminal.write(base64.decode(data));
        break;
      case ReceiveEvent.LOG:
        const level = flash_event.level
        const message = flash_event.message
        terminal.writeln(getLogColor(level)(`${level}: ${message}`));
        break;
    }
  }
  return terminal;
}

export interface BuildTerminal {
  target: Target;
  terminal: Terminal;
}

export function createBuildTerminals(targets: Target[]): BuildTerminal[] {
  return targets.map(target => ({
    target,
    terminal: createCommandTerminal(`build/${target.name}`, 'Build'),
  }));
}

export interface FlashTerminal {
  device: Device;
  terminal: Terminal;
}

export function createFlashTerminals(devices: Device[]): FlashTerminal[] {
  return devices.map(device => ({
    device,
    terminal: createCommandTerminal(`flash/${device.name}`, 'Flash'),
  }));
}
