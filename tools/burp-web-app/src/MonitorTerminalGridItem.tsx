import * as React from "react";
import {useMemo} from "react";
import {MonitorTerminalConnectParams, TerminalConnectType} from "./lib/ConnectTerminal";
import TerminalGridItem from "./TerminalGridItem";
import {Device} from "./lib/Device";

interface IProps {
  device: Device
}

export default function MonitorTerminalGridItem(props: IProps) {
  const device = props.device;
  const connectParams = useMemo<MonitorTerminalConnectParams>(() => ({
    type: TerminalConnectType.MONITOR,
    device: device,
  }), [device]);
  return (
    <TerminalGridItem connectParams={connectParams} caption={device.name}/>
  )
}
