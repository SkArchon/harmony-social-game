import { Action, createAction, createReducer, on, props } from '@ngrx/store';
import { logoutUser } from './user.reducer';

export const loadUserTickets = createAction('[User Tickets] Load User Tickets');
export const loadUserTicketsSuccess = createAction('[User Tickets] Load User Tickets Success', props<{ tickets: any[] }>());
export const loadUserTicketsFailure = createAction('[User Tickets] Load User Tickets Failure');

export interface State {
  loadingState: string;
  tickets: any[];
}

export const initialState: State = {
  loadingState: 'pending',
  tickets: []
};

export const reducer = createReducer(
  initialState,
  on(loadUserTicketsSuccess, (state, { tickets }) => ({ ...state, tickets, loadingState: 'success' })),
  on(loadUserTicketsFailure, (state) => ({ ...state, loadingState: 'error' })),
  on(logoutUser, (state) => {
    return ({ ...state, tickets: [], loadingState: 'success' });
  }),
);



