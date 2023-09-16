import base64 from "base-64";

export enum EventType {
  START = 'START',
  COMPLETE = 'COMPLETE',
  STDOUT = 'STDOUT',
  STDERR = 'STDERR',
  LOG = 'LOG',
  OUT = 'OUT',
}

enum OutEventType {
  STDIN = 'STDIN',
}

export class CommandStartEvent extends Event {
  public constructor() {
    super(EventType.START);
  }
}

export class CommandCompleteEvent extends Event {
  public constructor(public readonly exitCode: number) {
    super(EventType.COMPLETE);
  }
}

export class CommandStdOutEvent extends Event {
  public constructor(public readonly data: string) {
    super(EventType.STDOUT);
  }
}

export class CommandStdErrEvent extends Event {
  public constructor(public readonly data: string) {
    super(EventType.STDERR);
  }
}

export class CommandLogEvent extends Event {
  public constructor(public readonly level: string, public readonly message: string) {
    super(EventType.LOG);
  }
}

export class CommandOutEvent extends Event {
  public constructor(public readonly event: any) {
    super(EventType.OUT);
  }
}

export class Command extends EventTarget {
  public constructor() {
    super();
  }

  public onEvent(event: any) {
    switch (event.type) {
      case EventType.START:
        this.dispatchEvent(new CommandStartEvent());
        break;
      case EventType.COMPLETE:
        this.dispatchEvent(new CommandCompleteEvent(event['exit_code']));
        break;
      case EventType.STDOUT:
        this.dispatchEvent(new CommandStdOutEvent(base64.decode(event.data)));
        break;
      case EventType.STDERR:
        this.dispatchEvent(new CommandStdErrEvent(base64.decode(event.data)));
        break;
      case EventType.LOG:
        this.dispatchEvent(new CommandLogEvent(event.level, event.message));
        break;
    }
  }

  public stdin(data: string) {
    this.dispatchEvent(new CommandOutEvent({
      type: OutEventType.STDIN,
      data: base64.encode(data),
    }))
  }
}