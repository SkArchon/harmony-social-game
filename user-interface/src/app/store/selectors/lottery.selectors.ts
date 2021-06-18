import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { State } from '../reducers/lottery.reducer';
import { DateTime } from 'luxon';
import { CommonUtil } from 'app/common.util';
import { create } from 'domain';

export const getLotteryState = createFeatureSelector('lottery');

const _getCurrentParticipants = (state: State) => state.currentParticipants;
const _getMaxParticipants = (state: State) => state.maxParticipants;
const _getLoadingState = (state: State) => state.loadingState;
const _getDrawNumber = (state: State) => state.drawNumber;
const _getDrawPool = (state: State) => state.drawPool;
const _getTicketPrice = (state: State) => state.ticketPrice;
const _getHasWinnings = (state: State) => state.hasWinnings;
const _getUserBalance = (state: State) => state.userBalance;
const _getEnteredCurrentDraw = (state: State) => state.enteredCurrentDraw;

export const getCurrentParticipants = createSelector(
    getLotteryState,
    _getCurrentParticipants
);

export const getMaxParticipants = createSelector(
    getLotteryState,
    _getMaxParticipants
);

export const getIsDrawExpired = createSelector(
    getCurrentParticipants, getMaxParticipants,
    (curr, max) => curr === max
);

export const getLoadingState = createSelector(
    getLotteryState,
    _getLoadingState
);

export const getEnteredCurrentDraw = createSelector(
    getLotteryState,
    _getEnteredCurrentDraw
);

export const getDrawNumber = createSelector(
    getLotteryState,
    _getDrawNumber
);

export const getDrawPool = createSelector(
    getLotteryState,
    _getDrawPool
);

export const getDrawPoolFormatted = createSelector(
    getDrawPool,
    (drawPool) => CommonUtil.formatAmount(drawPool)
);

export const getTicketPrice = createSelector(
    getLotteryState,
    _getTicketPrice
);

export const getTicketPriceFormatted = createSelector(
    getTicketPrice,
    (ticketPrice) => CommonUtil.formatAmount(ticketPrice)
);

export const getHasWinnings = createSelector(
    getLotteryState,
    _getHasWinnings
);

export const getUserBalance = createSelector(
    getLotteryState,
    _getUserBalance
);

