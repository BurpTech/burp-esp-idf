import * as React from "react";
import GridItem from "./GridItem";
import {Box, Typography} from "@mui/material";
import XTerm from "./XTerm";
import {FlashTerminal} from "./lib/terminals/command-terminal";

interface IProps {
  flashTerminal: FlashTerminal
}

export default function FlashGridItem(props: IProps) {
  const {flashTerminal} = props;

  return (
    <GridItem>
      <Box display="flex" justifyContent="center">
        <Typography variant="h6" gutterBottom>
          {flashTerminal.deviceFlash.device.name}
        </Typography>
      </Box>
      <XTerm terminal={flashTerminal.terminal}/>
    </GridItem>
  )
}
