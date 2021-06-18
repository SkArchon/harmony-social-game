import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as lotteryDrawsReducer from 'app/store/reducers/lottery-draws.reducer';

export const getLotteryDrawsState = createFeatureSelector('lotteryDraws');
export const _getDraws = (state: lotteryDrawsReducer.State) => state.draws;
export const _getLoadingState = (state: lotteryDrawsReducer.State) => state.loadingState;

export const getDraws = createSelector(
    getLotteryDrawsState,
    _getDraws
);

export const getFirstThreeDraws = createSelector(
    getDraws,
    (draws) => {
        return (draws)
            ? draws.slice(0, 3)
            : [];
    }
);


export const getLoadingState = createSelector(
    getLotteryDrawsState,
    _getLoadingState
);
