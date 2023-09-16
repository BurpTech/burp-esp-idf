import * as React from "react";
import {Container, Grid} from "@mui/material";
import MonitorGridItem from "./MonitorGridItem";
import {MonitorTerminal} from "./lib/terminals/monitor-terminal";

interface Props {
  monitorTerminals: MonitorTerminal[];
}

export default function MonitorView(props: Props) {
  const {monitorTerminals} = props;

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        {monitorTerminals.map(monitorTerminal => (
          <MonitorGridItem key={monitorTerminal.deviceMonitor.device.name} monitorTerminal={monitorTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
