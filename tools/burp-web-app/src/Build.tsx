import * as React from "react";
import {Target} from "./lib/Target";
import {Grid} from "@mui/material";
import BuildTerminalGridItem from "./BuildTerminalGridItem";

interface BuildProps {
  targets: Target[];
}

export default function Build(props: BuildProps) {
  const targets = props.targets;
  return (
    <Grid container spacing={2}>
      {targets.map(target => (
        <BuildTerminalGridItem key={target.name} target={target}/>
      ))}
    </Grid>
  )
}
