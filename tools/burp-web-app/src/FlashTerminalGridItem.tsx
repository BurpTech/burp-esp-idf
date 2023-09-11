import * as React from "react";
import {useMemo} from "react";
import {CommandTerminalConnectParams, TerminalConnectType} from "./lib/ConnectTerminal";
import TerminalGridItem from "./TerminalGridItem";
import {Device} from "./lib/Device";

interface IProps {
  device: Device
}

export default function FlashTerminalGridItem(props: IProps) {
  const device = props.device;
  const connectParams = useMemo<CommandTerminalConnectParams>(() => ({
    type: TerminalConnectType.COMMAND,
    endpoint: `flash/${device.name}`,
    context: 'Flash',
  }), [device]);
  return (
    <TerminalGridItem connectParams={connectParams} caption={device.name}/>
  )
}
