import {Button, Container, Grid, Stack} from "@mui/material";
import * as React from "react";
import FlashGridItem from "./FlashGridItem";
import {FlashTerminal} from "./lib/terminals/command-terminal";

interface FlashProps {
  flashTerminals: FlashTerminal[];
}

export default function Flash(props: FlashProps) {
  const {flashTerminals} = props;

  function doFlash() {
    fetch('/flash').then(response => {
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
      </Stack>
      <Grid container spacing={2} height="100%">
        {flashTerminals.map(flashTerminal => (
          <FlashGridItem key={flashTerminal.device.name} flashTerminal={flashTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
