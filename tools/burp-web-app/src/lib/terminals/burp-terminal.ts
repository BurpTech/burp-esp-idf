import {Terminal} from "xterm";

export function createBurpTerminal(): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  const ws = new WebSocket('ws://localhost:8080/burp')
  ws.onmessage = event => {
    const data = event.data
    console.log(data)
    terminal.writeln(data)
  }
  return terminal;
}
