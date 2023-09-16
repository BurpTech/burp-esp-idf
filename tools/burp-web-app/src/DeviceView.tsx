import * as React from "react";
import {Button, Container, Grid, Stack} from "@mui/material";
import {Terminal} from "xterm";
import DeviceGridItem from "./DeviceGridItem";
import {Burp} from "./lib/websocket/Burp";

interface Props {
  burp: Burp,
  burpTerminal: Terminal,
  monitorTerminal: Terminal,
  flashTerminal: Terminal,
  buildTerminal: Terminal,
}

export default function DeviceView(props: Props) {
  const {
    burp,
    burpTerminal,
    monitorTerminal,
    flashTerminal,
    buildTerminal,
  } = props;

  function doFlash() {
    burp.flash();
  }

  function doBuild() {
    burp.build();
  }

  function doClean() {
    burp.clean();
  }

  function doFullClean() {
    burp.fullClean();
  }

  function doCheckDevices() {
    burp.checkDevices();
  }

  return (
    <Container maxWidth={false}>
      <Stack direction="row" spacing={2} paddingY={2}>
        <Button variant="contained" onClick={doFlash}>Flash</Button>
        <Button variant="contained" onClick={doBuild}>Build</Button>
        <Button variant="contained" onClick={doClean}>Clean</Button>
        <Button variant="contained" onClick={doFullClean}>Full Clean</Button>
        <Button variant="contained" onClick={doCheckDevices}>Check Devices</Button>
      </Stack>
      <Grid container spacing={2} height="100%">
        <DeviceGridItem caption="Monitor" terminal={monitorTerminal}/>
        <DeviceGridItem caption="Flash" terminal={flashTerminal}/>
        <DeviceGridItem caption="Build" terminal={buildTerminal}/>
        <DeviceGridItem caption="Burp" terminal={burpTerminal}/>
      </Grid>
    </Container>
  )
}
