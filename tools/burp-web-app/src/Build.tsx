import * as React from "react";
import {Container, Grid} from "@mui/material";
import BuildGridItem from "./BuildGridItem";
import {BuildTerminal} from "./lib/terminals/command-terminal";

interface BuildProps {
  buildTerminals: BuildTerminal[];
}

export default function Build(props: BuildProps) {
  const {buildTerminals} = props;
  return (
    <Container maxWidth={false}>
      <Grid container spacing={2} height="100%">
        {buildTerminals.map(buildTerminal => (
          <BuildGridItem key={buildTerminal.target.name} buildTerminal={buildTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
