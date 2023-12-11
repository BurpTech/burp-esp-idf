import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export enum Status {
  IDLE = 'idle',
  SCANNING = 'scanning',
  ERROR = 'error',
}

export interface ZeroconfState {
  status: Status;
  error: string | undefined;
}

const initialState: ZeroconfState = {
  status: Status.IDLE,
  error: undefined,
};

export const zeroconf = createSlice({
  name: 'zeroconf',
  initialState,
  reducers: {
    setScanning: state => {
      state.status = Status.SCANNING;
      state.error = undefined;
    },
    setIdle: state => {
      state.status = Status.IDLE;
      state.error = undefined;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = Status.ERROR;
      state.error = action.payload;
    },
  },
});

export const {setScanning, setIdle, setError} = zeroconf.actions;
