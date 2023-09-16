import {Terminal} from "xterm";
import {green, red, yellow} from "../colors";
import {Target} from "../Target";
import {Device} from "../Device";
import {DeviceFlash} from "../websocket/DeviceFlash";
import {
  Command,
  CommandCompleteEvent,
  CommandLogEvent,
  CommandStdErrEvent,
  CommandStdOutEvent,
  EventType
} from "../websocket/Command";
import {TargetBuild} from "../websocket/TargetBuild";

enum LogLevel {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
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

function createCommandTerminal(command: Command, context: string): Terminal {
  const terminal = new Terminal({
    convertEol: true,
  });
  terminal.onData((data) => command.stdin(data));
  command.addEventListener(EventType.START, () => {
    terminal.writeln(green(`Burp: ${context}: Start`));
  });
  command.addEventListener(EventType.COMPLETE, event => {
    const commandCompleteEvent = event as CommandCompleteEvent;
    const exitCode = commandCompleteEvent.exitCode;
    const color = exitCode === 0 ? green : red;
    terminal.writeln(color(`Burp: ${context}: Complete: exit code: ${exitCode}`));
  });
  command.addEventListener(EventType.STDOUT, event => {
    const commandStdOutEvent = event as CommandStdOutEvent;
    terminal.write(commandStdOutEvent.data);
  });
  command.addEventListener(EventType.STDERR, event => {
    const commandStdErrEvent = event as CommandStdErrEvent;
    terminal.write(commandStdErrEvent.data);
  });
  command.addEventListener(EventType.LOG, event => {
    const commandLogEvent = event as CommandLogEvent;
    const level = commandLogEvent.level
    terminal.writeln(getLogColor(level)(`${level}: ${commandLogEvent.message}`));
  });
  return terminal;
}

export interface BuildTerminal {
  targetBuild: TargetBuild;
  terminal: Terminal;
}

export function createBuildTerminals(targetBuilds: TargetBuild[]): BuildTerminal[] {
  return targetBuilds.map(targetBuild => ({
    targetBuild,
    terminal: createCommandTerminal(targetBuild, 'Build'),
  }));
}

export function getBuildTerminal(target: Target, buildTerminals: BuildTerminal[]): Terminal {
  for (const buildTerminal of buildTerminals) {
    if (buildTerminal.targetBuild.target.name === target.name) {
      return buildTerminal.terminal
    }
  }
  throw new Error(`Unknown target: ${target.name}`)
}

export interface FlashTerminal {
  deviceFlash: DeviceFlash;
  terminal: Terminal;
}

export function createFlashTerminals(deviceFlashes: DeviceFlash[]): FlashTerminal[] {
  return deviceFlashes.map(deviceFlash => ({
    deviceFlash,
    terminal: createCommandTerminal(deviceFlash, 'Flash'),
  }));
}

export function getFlashTerminal(device: Device, flashTerminals: FlashTerminal[]): Terminal {
  for (const flashTerminal of flashTerminals) {
    if (flashTerminal.deviceFlash.device.name === device.name) {
      return flashTerminal.terminal
    }
  }
  throw new Error(`Unknown device: ${device.name}`)
}
