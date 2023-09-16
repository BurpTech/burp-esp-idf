import {Device} from "../Device";
import {Command} from "./Command";

export class DeviceFlash extends Command {
  public constructor(public readonly device: Device) {
    super();
  }
}