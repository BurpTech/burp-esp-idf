import {Terminal} from "xterm";

export function connectBurpTerminal(terminal: Terminal): WebSocket {
  const ws = new WebSocket('ws://localhost:8080/burp')
  ws.onmessage = event => {
    const data = event.data
    console.log(data)
    terminal.writeln(data)
  }
  return ws;
}