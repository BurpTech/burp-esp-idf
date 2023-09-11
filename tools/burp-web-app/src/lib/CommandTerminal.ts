import {Terminal} from "xterm";
import { openpty } from "xterm-pty";
import {green, red} from "./colors";

let base64 = require('base-64');

enum Event {
  START = 'START',
  COMPLETE = 'COMPLETE',
  STDOUT = 'STDOUT',
  STDERR = 'STDERR',
}

export function connectCommandTerminal(terminal: Terminal, endpoint: string, context: string): WebSocket {
  const {master, slave} = openpty();
  terminal.loadAddon(master);
  const ws = new WebSocket(`ws://localhost:8080/${endpoint}`)
  ws.onmessage = event => {
    const flash_event = JSON.parse(event.data);
    switch (flash_event.event) {
      case Event.START:
        terminal.writeln(green(`Burp: ${context}: Start`));
        break;
      case Event.COMPLETE:
        const exit_code = flash_event.exit_code;
        const color = exit_code === 0 ? green : red;
        terminal.writeln(color(`Burp: ${context}: Complete: exit code: ${exit_code}`));
        break;
      case Event.STDOUT:
      case Event.STDERR:
        const data = flash_event.data
        slave.write(base64.decode(data));
        break;
    }
  }
  return ws;
}