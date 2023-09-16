import {Target} from "../Target";
import {Command} from "./Command";

export class TargetBuild extends Command {
  public constructor(public readonly target: Target) {
    super();
  }
}