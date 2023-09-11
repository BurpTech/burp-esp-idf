import {Box, Grid, Typography} from "@mui/material";
import XTerm from "./XTerm";
import * as React from "react";
import {useEffect, useMemo} from "react";
import {Terminal} from "xterm";
import {connectTerminal, TerminalConnectParams} from "./lib/ConnectTerminal";

interface IProps {
  connectParams: TerminalConnectParams;
  caption: string;
}

export default function TerminalGridItem(props: IProps) {
  const connectParams = props.connectParams;
  const caption = props.caption;
  const terminal = useMemo(() => new Terminal(), []);

  useEffect(() => {
    const ws = connectTerminal(terminal, connectParams);
    return () => {
      ws.close();
    };
  }, [terminal, connectParams]);

  return (
    <Grid item xs={12} sm={6} md={6} lg={4}>
      <Box display="flex" justifyContent="center">
        <Typography variant="h6" gutterBottom>
          {caption}
        </Typography>
      </Box>
      <XTerm terminal={terminal}/>
    </Grid>
  )
}
