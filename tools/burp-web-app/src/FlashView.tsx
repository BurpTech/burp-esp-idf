import {Button, Container, Grid, Stack} from "@mui/material";
import * as React from "react";
import FlashGridItem from "./FlashGridItem";
import {FlashTerminal} from "./lib/terminals/command-terminal";
import {Burp} from "./lib/websocket/Burp";

interface Props {
  burp: Burp,
  flashTerminals: FlashTerminal[];
}

export default function FlashView(props: Props) {
  const {burp, flashTerminals} = props;

  function doFlash() {
    burp.flash();
  }

  return (
    <Container maxWidth={false}>
      <Stack direction="row" spacing={2} paddingY={2}>
        <Button variant="contained" onClick={doFlash}>Flash</Button>
      </Stack>
      <Grid container spacing={2} height="100%">
        {flashTerminals.map(flashTerminal => (
          <FlashGridItem key={flashTerminal.deviceFlash.device.name} flashTerminal={flashTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
