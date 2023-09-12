import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Box, Tab, Tabs} from "@mui/material";
import {Device} from "./lib/Device";
import {Target} from "./lib/Target";
import Monitor from "./Monitor";
import Flash from "./Flash";
import Build from './Build';
import Burp from './Burp';
import {createBurpTerminal} from "./lib/terminals/burp-terminal";
import {createMonitorTerminals} from "./lib/terminals/monitor-terminal";
import {createBuildTerminals, createFlashTerminals} from "./lib/terminals/command-terminal";

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

export default function App() {
  const [tabIndex, setTabIndex] = React.useState(0);
  let initialDevices: Device[] = [];
  const [devices, setDevices] = useState(initialDevices);
  let initialTargets: Target[] = [];
  const [targets, setTargets] = useState(initialTargets);
  const burpTerminal = useMemo(() => createBurpTerminal(), []);
  const monitorTerminals = useMemo(() => createMonitorTerminals(devices), [devices]);
  const flashTerminals = useMemo(() => createFlashTerminals(devices), [devices]);
  const buildTerminals = useMemo(() => createBuildTerminals(targets), [targets]);

  useEffect(() => {
    fetch('/devices')
      .then(res => res.json()).then(data => {
      setDevices(data)
    });
  }, []);


  useEffect(() => {
    fetch('/targets')
      .then(res => res.json()).then(data => {
      setTargets(data)
    });
  }, []);

  const changeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{width: '100%'}}>
      <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
        <Tabs value={tabIndex} onChange={changeTab} aria-label="basic tabs example">
          <Tab label="Burp" {...a11yProps(0)} />
          <Tab label="Monitor" {...a11yProps(1)} />
          <Tab label="Flash" {...a11yProps(2)} />
          <Tab label="Build" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <BurpTabPanel value={tabIndex} index={0}>
        <Burp terminal={burpTerminal}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={1}>
        <Monitor monitorTerminals={monitorTerminals}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={2}>
        <Flash flashTerminals={flashTerminals}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={3}>
        <Build buildTerminals={buildTerminals}/>
      </BurpTabPanel>
    </Box>
  );
}