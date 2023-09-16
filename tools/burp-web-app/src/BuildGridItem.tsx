import * as React from "react";
import GridItem from "./GridItem";
import {Box, Typography} from "@mui/material";
import XTerm from "./XTerm";
import {BuildTerminal} from "./lib/terminals/command-terminal";

interface IProps {
  buildTerminal: BuildTerminal
}

export default function BuildGridItem(props: IProps) {
  const {buildTerminal} = props;

  return (
    <GridItem>
      <Box display="flex" justifyContent="center">
        <Typography variant="h6" gutterBottom>
          {buildTerminal.targetBuild.target.name}
        </Typography>
      </Box>
      <XTerm terminal={buildTerminal.terminal}/>
    </GridItem>
  )
}
