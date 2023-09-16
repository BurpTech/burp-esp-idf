import {Device} from "../Device";
import base64 from 'base-64';

export enum EventType {
  CONNECTION_MADE = 'CONNECTION_MADE',
  CONNECTION_LOST = 'CONNECTION_LOST',
  DATA_RECEIVED = 'DATA_RECEIVED',
  OUT = 'OUT',
}

enum OutEventType {
  DATA_SENT = 'DATA_SENT',
}

export class DeviceMonitorConnectionMadeEvent extends Event {
  public constructor() {
    super(EventType.CONNECTION_MADE);
  }
}

export class DeviceMonitorConnectionLostEvent extends Event {
  public constructor() {
    super(EventType.CONNECTION_LOST);
  }
}

export class DeviceMonitorDataReceivedEvent extends Event {
  public constructor(public readonly data: string) {
    super(EventType.DATA_RECEIVED);
  }
}

export class DeviceMonitorOutEvent extends Event {
  public constructor(public readonly event: any) {
    super(EventType.OUT);
  }
}

export class DeviceMonitor extends EventTarget {
  public constructor(public readonly device: Device) {
    super();
  }

  public onEvent(event: any) {
    switch (event.type) {
      case EventType.CONNECTION_MADE:
        this.dispatchEvent(new DeviceMonitorConnectionMadeEvent());
        break;
      case EventType.CONNECTION_LOST:
        this.dispatchEvent(new DeviceMonitorConnectionLostEvent());
        break;
      case EventType.DATA_RECEIVED:
        this.dispatchEvent(new DeviceMonitorDataReceivedEvent(base64.decode(event.data)));
        break;
    }
  }

  public sendData(data: string) {
    this.dispatchEvent(new DeviceMonitorOutEvent({
      type: OutEventType.DATA_SENT,
      data: base64.encode(data),
    }))
  }
}