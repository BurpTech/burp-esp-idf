import {Container, Grid} from "@mui/material";
import * as React from "react";
import FlashGridItem from "./FlashGridItem";
import {FlashTerminal} from "./lib/terminals/command-terminal";

interface FlashProps {
  flashTerminals: FlashTerminal[];
}

export default function Flash(props: FlashProps) {
  const {flashTerminals} = props;

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2} height="100%">
        {flashTerminals.map(flashTerminal => (
          <FlashGridItem key={flashTerminal.device.name} flashTerminal={flashTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
