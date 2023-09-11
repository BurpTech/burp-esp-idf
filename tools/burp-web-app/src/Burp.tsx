import * as React from "react";
import {useEffect, useMemo} from "react";
import XTerm from "./XTerm";
import {Container} from "@mui/material";
import {Terminal} from "xterm";
import {connectTerminal, TerminalConnectType} from "./lib/ConnectTerminal";

interface BurpProps {
}

export default function Burp(props: BurpProps) {
  const terminal = useMemo(() => new Terminal(), []);

  useEffect(() => {
    const ws = connectTerminal(terminal, {
      type: TerminalConnectType.BURP,
    });
    return () => {
      ws.close();
    };
  }, [terminal]);

  return (
    <Container maxWidth={false}>
      <XTerm terminal={terminal}/>
    </Container>
  )
}
