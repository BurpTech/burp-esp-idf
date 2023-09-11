import * as React from "react";
import {Component, createRef, RefObject} from "react";
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit'

interface XTermProps {
  terminal: Terminal
}

export default class XTerm extends Component<XTermProps> {
  terminalRef: RefObject<HTMLDivElement>;
  terminal: Terminal;

  constructor(props: XTermProps) {
    super(props);
    this.terminalRef = createRef();
    this.terminal = this.props.terminal;
  }

  componentDidMount() {
    if (this.terminalRef.current) {
      const fitAddon = new FitAddon();
      this.terminal.loadAddon(fitAddon)
      this.terminal.open(this.terminalRef.current)
      fitAddon.fit()
    }
  }

  render() {
    return <div ref={this.terminalRef}/>;
  }
}