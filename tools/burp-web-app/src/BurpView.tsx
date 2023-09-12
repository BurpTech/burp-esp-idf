import * as React from "react";
import {Button, Container, Stack} from "@mui/material";
import XTerm from "./XTerm";
import {Terminal} from "xterm";

interface IProps {
  terminal: Terminal,
}

export default function BurpView(props: IProps) {
  const {terminal} = props;

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
        <Button variant="contained" onClick={doCheckDevices}>Check Devices</Button>
      </Stack>
      <XTerm terminal={terminal}/>
    </Container>
  )
}
