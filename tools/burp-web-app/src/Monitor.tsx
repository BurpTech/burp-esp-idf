import * as React from "react";
import {Device} from "./lib/Device";
import {Grid} from "@mui/material";
import MonitorTerminalGridItem from "./MonitorTerminalGridItem";

interface MonitorProps {
  devices: Device[];
}

export default function Monitor(props: MonitorProps) {
  const devices = props.devices;
  return (
    <Grid container spacing={2}>
      {devices.map(device => (
        <MonitorTerminalGridItem key={device.name} device={device}/>
      ))}
    </Grid>
  )
}
