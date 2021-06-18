import { Action, createAction, createReducer, on, props } from '@ngrx/store';

export const loadLotteryDraws = createAction('[Lottery Draws] Load Lottery Draws');
export const loadLotteryDrawsSuccess = createAction('[Lottery Draws] Load Lottery Draws Success',
  props<{ draws: any[] }>());
export const loadLotteryDrawsFailure = createAction('[Lottery Draws] Load Lottery Draws Failure');

export interface State {
  draws: any[];
  loadingState: string;
}

export const initialState: State = {
  draws: [],
  loadingState: 'pending',
};

export const reducer = createReducer(
  initialState,
  on(loadLotteryDrawsSuccess, (state, { draws }) => {
    return ({ ...state, draws, loadingState: 'success' });
  }),
  on(loadLotteryDrawsFailure, (state) => {
    return ({ ...state, loadingState: 'error' });
  }),
);


