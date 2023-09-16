import {Device} from "../Device";
import {Target} from "../Target";

export enum EventType {
  INIT = 'INIT',
  LOG = 'LOG',
  OUT = 'OUT',
}

enum OutEventType {
  COMMAND = 'COMMAND',
}

enum Command {
  CHECK_DEVICES = 'CHECK_DEVICES',
  CLEAN = 'CLEAN',
  FULL_CLEAN = 'FULL_CLEAN',
  BUILD = 'BUILD',
  FLASH = 'FLASH',
}

export class BurpInitEvent extends Event {
  public constructor(public readonly devices: Device[], public readonly targets: Target[]) {
    super(EventType.INIT);
  }
}

export class BurpLogEvent extends Event {
  public constructor(public readonly line: string) {
    super(EventType.LOG);
  }
}

export class BurpOutEvent extends Event {
  public constructor(public readonly event: any) {
    super(EventType.OUT);
  }
}

export class Burp extends EventTarget {
  public onEvent(event: any) {
    switch (event.type) {
      case EventType.INIT:
        this.dispatchEvent(new BurpInitEvent(event.devices, event.targets));
        break;
      case EventType.LOG:
        this.dispatchEvent(new BurpLogEvent(event.line));
        break;
    }
  }

  public checkDevices() {
    this.dispatchEvent(new BurpOutEvent({
      type: OutEventType.COMMAND,
      command: Command.CHECK_DEVICES,
    }));
  }

  public clean() {
    this.dispatchEvent(new BurpOutEvent({
      type: OutEventType.COMMAND,
      command: Command.CLEAN,
    }));
  }

  public fullClean() {
    this.dispatchEvent(new BurpOutEvent({
      type: OutEventType.COMMAND,
      command: Command.FULL_CLEAN,
    }));
  }

  public build() {
    this.dispatchEvent(new BurpOutEvent({
      type: OutEventType.COMMAND,
      command: Command.BUILD,
    }));
  }

  public flash() {
    this.dispatchEvent(new BurpOutEvent({
      type: OutEventType.COMMAND,
      command: Command.FLASH,
    }));
  }
}