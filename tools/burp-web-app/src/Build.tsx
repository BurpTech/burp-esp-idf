import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import BuildGridItem from "./BuildGridItem";
import {Container} from "@mui/material";
import {BuildTerminal} from "./lib/terminals/command-terminal";

interface BuildProps {
  buildTerminals: BuildTerminal[];
}

export default function Build(props: BuildProps) {
  const {buildTerminals} = props;
  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        {buildTerminals.map(buildTerminal => (
          <BuildGridItem key={buildTerminal.target.name} buildTerminal={buildTerminal}/>
        ))}
      </Grid>
    </Container>
  )
}
