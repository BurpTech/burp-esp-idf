import {Terminal} from "xterm";
import websocketRoot from "./websocket-root";

export function createBurpTerminal(): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  const ws = new WebSocket(websocketRoot() + '/burp')
  ws.onmessage = event => {
    const data = event.data
    console.log(data)
    terminal.writeln(data)
  }
  return terminal;
}
