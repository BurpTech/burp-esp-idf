import * as React from "react";
import GridItem from "./GridItem";
import {Box, Typography} from "@mui/material";
import XTerm from "./XTerm";
import {MonitorTerminal} from "./lib/terminals/monitor-terminal";

interface IProps {
  monitorTerminal: MonitorTerminal
}

export default function MonitorGridItem(props: IProps) {
  const {monitorTerminal} = props;

  return (
    <GridItem>
      <Box display="flex" justifyContent="center">
        <Typography variant="h6" gutterBottom>
          {monitorTerminal.deviceMonitor.device.name}
        </Typography>
      </Box>
      <XTerm terminal={monitorTerminal.terminal}/>
    </GridItem>
  )
}
