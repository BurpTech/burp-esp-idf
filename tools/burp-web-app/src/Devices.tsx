import * as React from 'react';
import {Box, Button, Stack, Tab, Tabs} from "@mui/material";
import {getMonitorTerminal, MonitorTerminal} from "./lib/terminals/monitor-terminal";
import {BuildTerminal, FlashTerminal, getBuildTerminal, getFlashTerminal} from "./lib/terminals/command-terminal";
import {Terminal} from "xterm";
import {Device} from "./lib/Device";
import DeviceView from './DeviceView';

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
  setViewModeTasks: () => void;
  devices: Device[];
  burpTerminal: Terminal;
  monitorTerminals: MonitorTerminal[];
  flashTerminals: FlashTerminal[];
  buildTerminals: BuildTerminal[];
}

export default function Devices(props: IProps) {
  const [tabIndex, setTabIndex] = React.useState(0);
  const {
    setViewModeTasks,
    devices,
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
          <DeviceView burpTerminal={burpTerminal}
                      monitorTerminal={getMonitorTerminal(device, monitorTerminals)}
                      flashTerminal={getFlashTerminal(device, flashTerminals)}
                      buildTerminal={getBuildTerminal(device.target, buildTerminals)}/>
        </BurpTabPanel>
      ))}
    </Box>
  );
}