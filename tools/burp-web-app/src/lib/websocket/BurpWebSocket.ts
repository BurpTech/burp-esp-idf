import websocketRoot from "./websocketRoot";
import {Burp, BurpOutEvent, EventType as BurpEventType} from "./Burp";
import {EventType as MonitorEventType, Monitor, MonitorOutEvent} from "./Monitor";
import {EventType as FlashEventType, Flash, FlashOutEvent} from "./Flash";
import {Build, BuildOutEvent, EventType as BuildEventType} from "./Build";

enum EventType {
  BURP = 'BURP',
  MONITOR = 'MONITOR',
  FLASH = 'FLASH',
  BUILD = 'BUILD',
}

export interface Props {
  burp: Burp;
  monitor: Monitor;
  flash: Flash;
  build: Build;
}

export class BurpWebSocket {
  public constructor(private props: Props) {
  }

  public connect(): () => void {
    const isDev = process.env.NODE_ENV === 'development';
    const ws = isDev
      ? new WebSocket('ws://localhost:8080/ws')
      : new WebSocket(websocketRoot() + 'ws');
    ws.onmessage = message => {
      const event = JSON.parse(message.data);
      console.log(event);
      switch (event.type) {
        case EventType.BURP:
          this.props.burp.onEvent(event.event)
          break;
        case EventType.MONITOR:
          this.props.monitor.onEvent(event.event)
          break;
        case EventType.FLASH:
          this.props.flash.onEvent(event.event)
          break;
        case EventType.BUILD:
          this.props.build.onEvent(event.event)
          break;
      }
    }
    const burpOutListener = (event: Event) => {
      const burpOutEvent = event as BurpOutEvent;
      ws.send(JSON.stringify({
        type: EventType.BURP,
        event: burpOutEvent.event,
      }))
    };
    const monitorOutListener = (event: Event) => {
      const monitorOutEvent = event as MonitorOutEvent;
      ws.send(JSON.stringify({
        type: EventType.MONITOR,
        event: monitorOutEvent.event,
      }))
    };
    const flashOutListener = (event: Event) => {
      const flashOutEvent = event as FlashOutEvent;
      ws.send(JSON.stringify({
        type: EventType.FLASH,
        event: flashOutEvent.event,
      }))
    };
    const buildOutListener = (event: Event) => {
      const buildOutEvent = event as BuildOutEvent;
      ws.send(JSON.stringify({
        type: EventType.BUILD,
        event: buildOutEvent.event,
      }))
    };
    this.props.burp.addEventListener(BurpEventType.OUT, burpOutListener);
    this.props.monitor.addEventListener(MonitorEventType.OUT, monitorOutListener);
    this.props.flash.addEventListener(FlashEventType.OUT, flashOutListener);
    this.props.build.addEventListener(BuildEventType.OUT, buildOutListener);
    return () => {
      this.props.burp.removeEventListener(BurpEventType.OUT, burpOutListener);
      this.props.monitor.removeEventListener(MonitorEventType.OUT, monitorOutListener);
      this.props.flash.removeEventListener(FlashEventType.OUT, flashOutListener);
      this.props.build.removeEventListener(BuildEventType.OUT, buildOutListener);
      ws.close();
    }
  }
}
