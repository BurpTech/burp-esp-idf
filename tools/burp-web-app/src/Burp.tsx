import * as React from "react";
import {Container} from "@mui/material";
import XTerm from "./XTerm";
import {Terminal} from "xterm";

interface IProps {
  terminal: Terminal,
}

export default function Burp(props: IProps) {
  const {terminal} = props;

  return (
    <Container maxWidth={false}>
      <XTerm terminal={terminal}/>
    </Container>
  )
}
