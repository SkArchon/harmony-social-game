import { Action, createAction, createReducer, on, props } from '@ngrx/store';

export const setAccountAddress = createAction('[User] Set Account Address',  props<{ accountAddress: string }>());
export const logoutUser = createAction('[User] Logout Request');

export const userFeatureKey = 'user';

export interface State {
  accountAddress: string;
}

export const initialState: State = {
  accountAddress: null
};

export const reducer = createReducer(
  initialState,
  on(setAccountAddress, (state, { accountAddress }) => ({ ...state, accountAddress })),
  on(logoutUser, (state) => ({...initialState}))
);



