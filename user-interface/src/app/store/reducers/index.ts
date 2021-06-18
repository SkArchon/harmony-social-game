import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  INIT,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { logoutUser } from './user.reducer';

import {
  reducer as lotteryReducer,
  State as LotteryState
} from './lottery.reducer';

import {
  reducer as userReducer,
  State as UserState
} from './user.reducer';

import {
  reducer as userTicketReducer,
  State as UserTicketState
} from './user-ticket.reducer';

import {
  reducer as lotteryDrawsReducer,
  State as lotteryDrawsState
} from './lottery-draws.reducer';


export interface AppState {
  lottery: LotteryState;
  user: UserState;
  userTicket: UserTicketState;
  lotteryDraws: lotteryDrawsState;
}

export const reducers: ActionReducerMap<AppState> = {
  lottery: lotteryReducer,
  user: userReducer,
  userTicket: userTicketReducer,
  lotteryDraws: lotteryDrawsReducer
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['user'], rehydrate: true })(reducer);
}

// const commonReducers = [];
const commonReducers = [localStorageSyncReducer];
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [...commonReducers] : [...commonReducers];
