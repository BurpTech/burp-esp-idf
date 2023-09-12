import * as React from "react";
import {useEffect, useRef} from "react";
import {Terminal} from 'xterm'
import {FitAddon} from "xterm-addon-fit";

interface IProps {
  terminal: Terminal;
}

export default function XTerm(props: IProps) {
  const {terminal} = props;
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current !== null) {
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon)
      terminal.open(terminalRef.current)
      fitAddon.fit()
    }
  }, [terminal]);

  return <div ref={terminalRef}/>;
}
