import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { State } from '../reducers/user-ticket.reducer';

export const getUserTicketState = createFeatureSelector('userTicket');

const _getLoadingState = (state: State) => state.loadingState;
const _getTickets = (state: State) => state.tickets;

export const getLoadingState = createSelector(
    getUserTicketState,
    _getLoadingState
);

export const getTickets = createSelector(
    getUserTicketState,
    _getTickets
);

export const getFirstThreeTickets = createSelector(
    getTickets,
    (tickets) => {
        return (tickets)
            ? tickets.slice(0, 3)
            : [];
    }
);


