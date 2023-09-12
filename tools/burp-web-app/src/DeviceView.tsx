import * as React from "react";
import {Button, Container, Grid, Stack} from "@mui/material";
import {Terminal} from "xterm";
import DeviceGridItem from "./DeviceGridItem";

interface BuildProps {
  burpTerminal: Terminal,
  monitorTerminal: Terminal,
  flashTerminal: Terminal,
  buildTerminal: Terminal,
}

export default function DeviceView(props: BuildProps) {
  const {
    burpTerminal,
    monitorTerminal,
    flashTerminal,
    buildTerminal,
  } = props;

  function doFlash() {
    fetch('/flash').then(response => {
      console.log(response.status);
      response.json().then(data => {
        console.log(data);
      });
    });
  }

  function doBuild() {
    fetch('/build').then(response => {
      console.log(response.status);
      response.json().then(data => {
        console.log(data);
      });
    });
  }

  function doClean() {
    fetch('/clean').then(response => {
      console.log(response.status);
      response.json().then(data => {
        console.log(data);
      });
    });
  }

  function doFullClean() {
    fetch('/fullclean').then(response => {
      console.log(response.status);
      response.json().then(data => {
        console.log(data);
      });
    });
  }

  function doCheckDevices() {
    fetch('/check-devices').then(response => {
      console.log(response.status);
      response.json().then(data => {
        console.log(data);
      });
    });
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
