import {Grid} from "@mui/material";
import * as React from "react";
import {ReactNode} from "react";

interface IProps {
  children?: ReactNode;
}

export default function GridItem(props: IProps) {
  const {children} = props;

  return (
    <Grid item xs={12} sm={6} md={6} lg={4}>
      {children}
    </Grid>
  )
}
