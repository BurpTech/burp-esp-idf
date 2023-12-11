import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export enum Status {
  IDLE = 'idle',
  SCANNING = 'scanning',
  ERROR = 'error',
}

export interface ZeroconfState {
  status: Status;
  query: string | undefined;
  error: string | undefined;
}

export interface ZeroconfError {
  query: string;
  message: string;
}

const initialState: ZeroconfState = {
  status: Status.IDLE,
  query: undefined,
  error: undefined,
};

export const zeroconf = createSlice({
  name: 'zeroconf',
  initialState,
  reducers: {
    setScanning: (state, action: PayloadAction<string>) => {
      state.status = Status.SCANNING;
      state.query = action.payload;
      state.error = undefined;
    },
    setIdle: state => {
      state.status = Status.IDLE;
      state.query = undefined;
      state.error = undefined;
    },
    setError: (state, action: PayloadAction<ZeroconfError>) => {
      state.status = Status.ERROR;
      state.query = action.payload.query;
      state.error = action.payload.message;
    },
  },
});

export const {setScanning, setIdle, setError} = zeroconf.actions;
