import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as userReducer from 'app/store/reducers/user.reducer';

export const getUserState = createFeatureSelector('user');
export const _getAccountAddress = (state: userReducer.State) => state.accountAddress;

export const getAccountAddress = createSelector(
    getUserState,
    _getAccountAddress
);

export const getAccountAddressShortened = createSelector(
    getAccountAddress,
    (address) => {
        return (!address)
          ? address
          : address.substring(0, 5) + '...' + address.substring(address.length - 3);
    }
);


