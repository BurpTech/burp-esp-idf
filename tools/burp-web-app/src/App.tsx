import * as React from 'react';
import {useEffect, useState} from 'react';
import {Box, Tab, Tabs} from "@mui/material";
import {Device} from "./lib/Device";
import {Target} from "./lib/Target";
import Monitor from "./Monitor";
import Flash from "./Flash";
import Build from './Build';
import Burp from './Burp';

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
      <Box>
        {children}
      </Box>
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
        <Burp/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={1}>
        <Monitor devices={devices}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={2}>
        <Flash devices={devices}/>
      </BurpTabPanel>
      <BurpTabPanel value={tabIndex} index={3}>
        <Build targets={targets}/>
      </BurpTabPanel>
    </Box>
  );
}