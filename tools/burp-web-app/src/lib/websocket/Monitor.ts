import {Burp, BurpInitEvent, EventType as BurpEventType} from "./Burp";
import {DeviceMonitor, DeviceMonitorOutEvent, EventType as DeviceMonitorEventType} from "./DeviceMonitor";

export enum EventType {
  DEVICES = 'DEVICES',
  OUT = 'OUT',
}

export class MonitorDevicesEvent extends Event {
  public constructor(public readonly deviceMonitors: DeviceMonitor[]) {
    super(EventType.DEVICES);
  }
}

export class MonitorOutEvent extends Event {
  public constructor(public readonly event: any) {
    super(EventType.OUT);
  }
}

export class Monitor extends EventTarget {
  private deviceMonitorMap: Record<string, DeviceMonitor> = {};

  public constructor(burp: Burp) {
    super();
    burp.addEventListener(BurpEventType.INIT, event => {
      this.deviceMonitorMap = Object.fromEntries((event as BurpInitEvent).devices.map(device => {
        const deviceMonitor = new DeviceMonitor(device);
        deviceMonitor.addEventListener(DeviceMonitorEventType.OUT, event => {
          const deviceMonitorOutEvent = event as DeviceMonitorOutEvent;
          this.dispatchEvent(new MonitorOutEvent({
            device: device.name,
            event: deviceMonitorOutEvent.event,
          }));
        });
        return [device.name, deviceMonitor];
      }));
      this.dispatchEvent(new MonitorDevicesEvent(Object.values(this.deviceMonitorMap)))
    })
  }

  public onEvent(event: any) {
    const deviceMonitor = this.deviceMonitorMap[event.device];
    if (deviceMonitor) {
      deviceMonitor.onEvent(event.event);
    }
  }
}