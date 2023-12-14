import {BurpState, store} from '../store';
import {ActionCreatorWithPayload} from '@reduxjs/toolkit';

const INTERVAL_MS: number = 5000;
const MAX_AGE_MS: number = 20000;

export type Cleanable = {
  id: string;
  timestamp: number;
};

export type CleanTarget = {
  selector: (state: BurpState) => Cleanable[];
  removeActionCreator: ActionCreatorWithPayload<string>;
};

export class Cleaner {
  public constructor(private targets: CleanTarget[]) {}

  private clean() {
    const now = Date.now();
    this.targets.forEach(target => {
      const cleanables = target.selector(store.getState());
      cleanables.forEach(cleanable => {
        if (now - cleanable.timestamp > MAX_AGE_MS) {
          store.dispatch(target.removeActionCreator(cleanable.id));
        }
      });
    });
  }

  public start() {
    this.clean();
    setInterval(() => {
      this.clean();
    }, INTERVAL_MS);
  }
}
