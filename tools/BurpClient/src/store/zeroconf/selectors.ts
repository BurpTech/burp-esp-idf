import {createSelector} from '@reduxjs/toolkit';
import {selectZeroconfState} from '../index.ts';

export const selectZeroconfStatus = createSelector(
  [selectZeroconfState],
  state => state.status,
);

export const selectZeroconfQuery = createSelector(
  [selectZeroconfState],
  state => state.query,
);

export const selectZeroconfError = createSelector(
  [selectZeroconfState],
  state => state.error,
);
