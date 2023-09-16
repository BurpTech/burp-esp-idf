import {Burp, BurpInitEvent, EventType as BurpEventType} from "./Burp";
import {DeviceFlash} from "./DeviceFlash";
import {CommandOutEvent, EventType as CommandEventType} from "./Command";

export enum EventType {
  DEVICES = 'DEVICES',
  OUT = 'OUT',
}

export class FlashDevicesEvent extends Event {
  public constructor(public readonly deviceFlashes: DeviceFlash[]) {
    super(EventType.DEVICES);
  }
}

export class FlashOutEvent extends Event {
  public constructor(public readonly event: any) {
    super(EventType.OUT);
  }
}

export class Flash extends EventTarget {
  private deviceFlashMap: Record<string, DeviceFlash> = {};

  public constructor(burp: Burp) {
    super();
    burp.addEventListener(BurpEventType.INIT, event => {
      this.deviceFlashMap = Object.fromEntries((event as BurpInitEvent).devices.map(device => {
        const deviceFlash = new DeviceFlash(device);
        deviceFlash.addEventListener(CommandEventType.OUT, event => {
          const commandOutEvent = event as CommandOutEvent;
          this.dispatchEvent(new FlashOutEvent({
            device: device.name,
            event: commandOutEvent.event,
          }));
        });
        return [device.name, deviceFlash];
      }));
      this.dispatchEvent(new FlashDevicesEvent(Object.values(this.deviceFlashMap)))
    })
  }

  public onEvent(event: any) {
    const deviceFlash = this.deviceFlashMap[event.device];
    if (deviceFlash) {
      deviceFlash.onEvent(event.event);
    }
  }
}