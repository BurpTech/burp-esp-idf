import * as React from 'react';
import {Box, Button, Stack, Tab, Tabs} from "@mui/material";
import MonitorView from "./MonitorView";
import FlashView from "./FlashView";
import Build from './Build';
import BurpView from './BurpView';
import {MonitorTerminal} from "./lib/terminals/monitor-terminal";
import {BuildTerminal, FlashTerminal} from "./lib/terminals/command-terminal";
import {Terminal} from "xterm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function BurpTabPanel(props: TabPanelProps) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface IProps {
  setViewModeDevices: () => void;
  burpTerminal: Terminal;
  monitorTerminals: MonitorTerminal[];
  flashTerminals: FlashTerminal[];
  buildTerminals: BuildTerminal[];
}

export default function Tasks(props: IProps) {
  const [tabIndex, setTabIndex] = React.useState(0);
  const {
    setViewModeDevices,
    burpTerminal,
    monitorTerminals,
    flashTerminals,
    buildTerminals,
  } = props;

  const changeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{width: '100%'}}>
      <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
        <Stack direction="row" justifyContent="space-between">
          <Tabs value={tabIndex} onChange={changeTab} aria-label="basic tabs example">
            <Tab label="BurpView" {...a11yProps(0)} />
            <Tab label="MonitorView" {...a11yProps(1)} />
            <Tab label="FlashView" {...a11yProps(2)} />
            <Tab label="Build" {...a11yProps(3)} />
          </Tabs>
          <Button onClick={() => setViewModeDevices()}>Devices</Button>
        </Stack>
      </Box>
      <BurpTabPanel value={tabIndex} index={0}>
        <BurpView terminal={burpTerminal}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={1}>
        <MonitorView monitorTerminals={monitorTerminals}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={2}>
        <FlashView flashTerminals={flashTerminals}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={3}>
        <Build buildTerminals={buildTerminals}/>
      </BurpTabPanel>
    </Box>
  );
}