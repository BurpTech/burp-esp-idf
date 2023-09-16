import {Burp, BurpInitEvent, EventType as BurpEventType} from "./Burp";
import {TargetBuild} from "./TargetBuild";
import {CommandOutEvent, EventType as CommandEventType} from "./Command";

export enum EventType {
  TARGETS = 'TARGETS',
  OUT = 'OUT',
}

export class BuildTargetsEvent extends Event {
  public constructor(public readonly targetBuilds: TargetBuild[]) {
    super(EventType.TARGETS);
  }
}

export class BuildOutEvent extends Event {
  public constructor(public readonly event: any) {
    super(EventType.OUT);
  }
}

export class Build extends EventTarget {
  private targetBuildMap: Record<string, TargetBuild> = {};

  public constructor(burp: Burp) {
    super();
    burp.addEventListener(BurpEventType.INIT, event => {
      this.targetBuildMap = Object.fromEntries((event as BurpInitEvent).targets.map(target => {
        const targetBuild = new TargetBuild(target);
        targetBuild.addEventListener(CommandEventType.OUT, event => {
          const commandOutEvent = event as CommandOutEvent;
          this.dispatchEvent(new BuildOutEvent({
            target: target.name,
            event: commandOutEvent.event,
          }));
        });
        return [target.name, targetBuild];
      }));
      this.dispatchEvent(new BuildTargetsEvent(Object.values(this.targetBuildMap)))
    })
  }

  public onEvent(event: any) {
    const targetBuild = this.targetBuildMap[event.target];
    if (targetBuild) {
      targetBuild.onEvent(event.event);
    }
  }
}