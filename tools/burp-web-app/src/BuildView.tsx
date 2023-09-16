import * as React from "react";
import {Button, Container, Grid, Stack} from "@mui/material";
import BuildGridItem from "./BuildGridItem";
import {BuildTerminal} from "./lib/terminals/command-terminal";
import {Burp} from "./lib/websocket/Burp";

interface Props {
  burp: Burp,
  buildTerminals: BuildTerminal[];
}

export default function BuildView(props: Props) {
  const {burp, buildTerminals} = props;

  function doBuild() {
    burp.build();
  }

  function doClean() {
    burp.clean();
  }

  function doFullClean() {
    burp.fullClean();
  }

  return (
    <Container maxWidth={false}>
      <Stack direction="row" spacing={2} paddingY={2}>
        <Button variant="contained" onClick={doBuild}>Build</Button>
        <Button variant="contained" onClick={doClean}>Clean</Button>
        <Button variant="contained" onClick={doFullClean}>Full Clean</Button>
      </Stack>
      <Grid container spacing={2} height="100%">
        {buildTerminals.map(buildTerminal => (
          <BuildGridItem key={buildTerminal.targetBuild.target.name} buildTerminal={buildTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
