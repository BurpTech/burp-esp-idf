import {Grid} from "@mui/material";
import * as React from "react";
import {Device} from "./lib/Device";
import FlashTerminalGridItem from "./FlashTerminalGridItem";

interface FlashProps {
  devices: Device[];
}

export default function Flash(props: FlashProps) {
  const devices = props.devices;
  return (
    <Grid container spacing={2}>
      {devices.map(device => (
        <FlashTerminalGridItem key={device.name} device={device}/>
      ))}
    </Grid>
  )
}
