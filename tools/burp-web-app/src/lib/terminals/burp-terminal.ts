import {Terminal} from "xterm";
import {Burp, BurpLogEvent, EventType} from "../websocket/Burp";

export function createBurpTerminal(burp: Burp): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  burp.addEventListener(EventType.LOG, event => {
    const burpLogEvent = event as BurpLogEvent;
    const line = burpLogEvent.line;
    console.log(line);
    terminal.writeln(line);
  })
  return terminal;
}
