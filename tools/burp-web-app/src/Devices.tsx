import * as React from 'react';
import {Box, Button, Stack, Tab, Tabs} from "@mui/material";
import {getMonitorTerminal, MonitorTerminal} from "./lib/terminals/monitor-terminal";
import {BuildTerminal, FlashTerminal, getBuildTerminal, getFlashTerminal} from "./lib/terminals/command-terminal";
import {Terminal} from "xterm";
import {Device} from "./lib/Device";
import DeviceView from './DeviceView';
import {Burp} from "./lib/websocket/Burp";

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

interface Props {
  setViewModeTasks: () => void;
  devices: Device[];
  burp: Burp;
  burpTerminal: Terminal;
  monitorTerminals: MonitorTerminal[];
  flashTerminals: FlashTerminal[];
  buildTerminals: BuildTerminal[];
}

export default function Devices(props: Props) {
  const [tabIndex, setTabIndex] = React.useState(0);
  const {
    setViewModeTasks,
    devices,
    burp,
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
            {devices.map((device, index) => (
              <Tab label={device.name} {...a11yProps(index)} />
            ))}
          </Tabs>
          <Button onClick={() => setViewModeTasks()}>Tasks</Button>
        </Stack>
      </Box>
      {devices.map((device, index) => (
        <BurpTabPanel value={tabIndex} index={index}>
          <DeviceView burp={burp}
                      burpTerminal={burpTerminal}
                      monitorTerminal={getMonitorTerminal(device, monitorTerminals)}
                      flashTerminal={getFlashTerminal(device, flashTerminals)}
                      buildTerminal={getBuildTerminal(device.target, buildTerminals)}/>
        </BurpTabPanel>
      ))}
    </Box>
  );
}