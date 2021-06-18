import { Action, createAction, createReducer, on, props } from '@ngrx/store';
import { logoutUser } from './user.reducer';

export const approveContract = createAction('[Lottery] Approve Contract');
export const lotteryLoadData = createAction('[Lottery] Load Lottery Data');
export const lotteryDataLoadSuccess = createAction('[Lottery] Load Lottery Data Success',
  props<{
    currentParticipants: number, enteredCurrentDraw: boolean, maxParticipants: number,
    drawPool: number, drawNumber: number, ticketPrice: number
  }>());
export const lotteryDataLoadFailure = createAction('[Lottery] Load Lottery Data Failure');
export const lotteryFeatureKey = 'lottery';

export const loadCurrentContractAllowanceSuccess = createAction('[Lottery] Set Current Contract Allowance',
  props<{ contractAllowance: number }>());
export const loadCurrentContractAllowanceFailure = createAction('[Lottery] Load Current Contract Allowance Failure');

export const checkForWinnings = createAction('[Lottery] Check For Winnings');
export const checkForWinningsFailure = createAction('[Lottery] Check For Winnings Failure');
export const setHasWinnings = createAction('[Lottery] Set Has Winnings');

export interface State {
  currentParticipants: number;
  maxParticipants: number;
  drawPool: number;
  drawNumber: number;
  loadingState: 'success' | 'pending' | 'error';
  ticketPrice: number;
  hasWinnings: boolean;
  enteredCurrentDraw: boolean;
  userBalance: number;
}

export const initialState: State = {
  currentParticipants: null,
  maxParticipants: null,
  drawPool: null,
  drawNumber: null,
  loadingState: 'pending',
  ticketPrice: null,
  hasWinnings: false,
  enteredCurrentDraw: false,
  userBalance: null
};

export const reducer = createReducer(
  initialState,
  on(lotteryDataLoadSuccess, (state, { currentParticipants, maxParticipants, drawPool, enteredCurrentDraw, drawNumber, ticketPrice }) => {
    return ({ ...state, currentParticipants, maxParticipants, drawPool, 
      drawNumber, enteredCurrentDraw, ticketPrice, loadingState: 'success' });
  }),
  on(lotteryDataLoadFailure, (state) => {
    return ({ ...state, loadingState: 'error' });
  }),
  on(setHasWinnings, (state) => {
    return ({ ...state, hasWinnings: true });
  }),
  on(logoutUser, (state) => {
    return ({ ...state, hasWinnings: false, lotteryAllowance: null, userBalance: null });
  }),
);


