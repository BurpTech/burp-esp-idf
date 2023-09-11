import * as React from "react";
import {useMemo} from "react";
import {CommandTerminalConnectParams, TerminalConnectType} from "./lib/ConnectTerminal";
import TerminalGridItem from "./TerminalGridItem";
import {Target} from "./lib/Target";

interface IProps {
  target: Target
}

export default function BuildTerminalGridItem(props: IProps) {
  const target = props.target;
  const connectParams = useMemo<CommandTerminalConnectParams>(() => ({
    type: TerminalConnectType.COMMAND,
    endpoint: `build/${target.name}`,
    context: 'Build',
  }), [target]);
  return (
    <TerminalGridItem connectParams={connectParams} caption={target.name}/>
  )
}
