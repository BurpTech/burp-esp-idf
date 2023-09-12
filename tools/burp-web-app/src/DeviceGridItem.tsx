import * as React from "react";
import GridItem from "./GridItem";
import {Box, Typography} from "@mui/material";
import XTerm from "./XTerm";
import {Terminal} from "xterm";

interface IProps {
  caption: string;
  terminal: Terminal;
}

export default function DeviceGridItem(props: IProps) {
  const {caption, terminal} = props;

  return (
    <GridItem>
      <Box display="flex" justifyContent="center">
        <Typography variant="h6" gutterBottom>
          {caption}
        </Typography>
      </Box>
      <XTerm terminal={terminal}/>
    </GridItem>
  )
}
