import {Device} from "./Device";
import {Terminal} from "xterm";
import {connectBurpTerminal} from "./BurpTerminal";
import {connectMonitorTerminal} from "./MonitorTerminal";
import {connectCommandTerminal} from "./CommandTerminal";

export enum TerminalConnectType {
  BURP,
  MONITOR,
  COMMAND,
}

export interface BurpTerminalConnectParams {
  type: TerminalConnectType.BURP;
}

export interface MonitorTerminalConnectParams {
  type: TerminalConnectType.MONITOR;
  device: Device;
}

export interface CommandTerminalConnectParams {
  type: TerminalConnectType.COMMAND;
  endpoint: string;
  context: string;
}

export type TerminalConnectParams =
  BurpTerminalConnectParams |
  MonitorTerminalConnectParams |
  CommandTerminalConnectParams;

export function connectTerminal(terminal: Terminal, params: TerminalConnectParams): WebSocket {
  switch (params.type) {
    case TerminalConnectType.BURP:
      return connectBurpTerminal(terminal);
    case TerminalConnectType.MONITOR:
      return connectMonitorTerminal(terminal, params.device);
    case TerminalConnectType.COMMAND:
      return connectCommandTerminal(terminal, params.endpoint, params.context);
  }
}