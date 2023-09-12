import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {Container} from "@mui/material";
import MonitorGridItem from "./MonitorGridItem";
import {MonitorTerminal} from "./lib/terminals/monitor-terminal";

interface MonitorProps {
  monitorTerminals: MonitorTerminal[];
}

export default function Monitor(props: MonitorProps) {
  const {monitorTerminals} = props;

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        {monitorTerminals.map(monitorTerminal => (
          <MonitorGridItem key={monitorTerminal.device.name} monitorTerminal={monitorTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
