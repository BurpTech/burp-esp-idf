import {Target} from "./Target";

export interface Device {
  baudrate: number,
  name: string,
  port: string,
  target: Target,
}