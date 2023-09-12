import * as React from "react";
import {Button, Container, Grid, Stack} from "@mui/material";
import BuildGridItem from "./BuildGridItem";
import {BuildTerminal} from "./lib/terminals/command-terminal";

interface BuildProps {
  buildTerminals: BuildTerminal[];
}

export default function Build(props: BuildProps) {
  const {buildTerminals} = props;

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

  return (
    <Container maxWidth={false}>
      <Stack direction="row" spacing={2} paddingY={2}>
        <Button variant="contained" onClick={doBuild}>Build</Button>
        <Button variant="contained" onClick={doClean}>Clean</Button>
        <Button variant="contained" onClick={doFullClean}>Full Clean</Button>
      </Stack>
      <Grid container spacing={2} height="100%">
        {buildTerminals.map(buildTerminal => (
          <BuildGridItem key={buildTerminal.target.name} buildTerminal={buildTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
