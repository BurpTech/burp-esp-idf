import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Device} from "./lib/Device";
import {Target} from "./lib/Target";
import {createBurpTerminal} from "./lib/terminals/burp-terminal";
import {createMonitorTerminals} from "./lib/terminals/monitor-terminal";
import {createBuildTerminals, createFlashTerminals} from "./lib/terminals/command-terminal";
import Tasks from "./Tasks";
import Devices from "./Devices";

enum ViewMode {
  TASKS,
  DEVICES,
}

export default function App() {
  const [viewMode, setViewMode] = React.useState(ViewMode.TASKS);
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

  switch (viewMode) {
    case ViewMode.TASKS:
      return <Tasks setViewModeDevices={() => setViewMode(ViewMode.DEVICES)}
                    burpTerminal={burpTerminal}
                    monitorTerminals={monitorTerminals}
                    flashTerminals={flashTerminals}
                    buildTerminals={buildTerminals}/>
    case ViewMode.DEVICES:
      return <Devices setViewModeTasks={() => setViewMode(ViewMode.TASKS)}
                      devices={devices}
                      burpTerminal={burpTerminal}
                      monitorTerminals={monitorTerminals}
                      flashTerminals={flashTerminals}
                      buildTerminals={buildTerminals}/>
  }
}