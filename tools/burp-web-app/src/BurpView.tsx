import * as React from "react";
import {Button, Container, Stack} from "@mui/material";
import XTerm from "./XTerm";
import {Terminal} from "xterm";
import {Burp} from "./lib/websocket/Burp";

interface Props {
  burp: Burp,
  terminal: Terminal,
}

export default function BurpView(props: Props) {
  const {burp, terminal} = props;

  function doCheckDevices() {
    burp.checkDevices();
  }

  return (
    <Container maxWidth={false}>
      <Stack direction="row" spacing={2} paddingY={2}>
        <Button variant="contained" onClick={doCheckDevices}>Check Devices</Button>
      </Stack>
      <XTerm terminal={terminal}/>
    </Container>
  )
}
