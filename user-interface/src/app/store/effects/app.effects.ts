
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CommonUtil } from 'app/common.util';
import { BackendService } from 'app/service/backend.service';
import { ContractService } from 'app/service/contract.service';
import { from, of, timer } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { loadLotteryDraws, loadLotteryDrawsFailure, loadLotteryDrawsSuccess } from '../reducers/lottery-draws.reducer';
import { checkForWinnings, checkForWinningsFailure, lotteryDataLoadFailure, lotteryDataLoadSuccess, lotteryLoadData, setHasWinnings } from '../reducers/lottery.reducer';
import { loadUserTickets, loadUserTicketsFailure, loadUserTicketsSuccess } from '../reducers/user-ticket.reducer';
import { logoutUser } from '../reducers/user.reducer';
import { getAccountAddress } from '../selectors/users.selectors';

@Injectable()
export class AppEffects {

  private checkHasWinningsInitialized = false;

  constructor(private actions$: Actions,
              private store: Store,
              private contractService: ContractService,
              private backendService: BackendService) { }

  LoadDataEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(lotteryLoadData),
      withLatestFrom(this.store.select(getAccountAddress)),
      mergeMap(([_, address]) => {
        const setAddress = (address)
          ? address
          : '0x0000000000000000000000000000000000000000';
        const loadDataValuesP$ = this.contractService.getLotteryContract()
          .methods
          .getDetails(setAddress)
          .call();
        return from(loadDataValuesP$);
      }),
      map((result: any) => {
        const data = {
          currentParticipants: Number(result.currentParticipants),
          maxParticipants: Number(result.maxParticipants),
          drawPool: Number(CommonUtil.getNumber(result.amount)),
          drawNumber: Number(result.currentDrawNumber),
          ticketPrice: Number(CommonUtil.getNumber(result.ticketPrice)),
          enteredCurrentDraw: result.enteredCurrentDraw
        };
        return lotteryDataLoadSuccess(data);
      }),
      catchError((error) => {
        console.log(error);
        return of(lotteryDataLoadFailure());
      })
    )
  );

  LoadUserTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUserTickets),
      withLatestFrom(this.store.select(getAccountAddress)),
      switchMap(([_, accountAddress]) => {
        if (!accountAddress) {
          return of([]);
        }
        const loadDataValuesP$ = this.contractService.getLotteryContract()
          .methods
          .getUserTickets(accountAddress)
          .call();
        return from(loadDataValuesP$);
      }),
      map((tickets: any[]) => {
        const data = { tickets };
        return loadUserTicketsSuccess(data);
      }),
      catchError((_error) => {
        console.log(_error);
        return of(loadUserTicketsFailure());
      })
    )
  );

  CheckHasWinnings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(checkForWinnings),
      filter(() => !this.checkHasWinningsInitialized),
      switchMap((_) => {
        this.checkHasWinningsInitialized = true;
        return timer(0, 60000).pipe(
          withLatestFrom(this.store.select(getAccountAddress)),
          filter(([_timerData, accountAddress]) => !!accountAddress),
          mergeMap(([_timerData, accountAddress]) => {
            const winningsP$ = this.contractService.getLotteryContract()
              .methods
              .hasUnclaimedWinnings(accountAddress)
              .call();
            return from(winningsP$);
          }),
          filter((results: any) => results.userHasUnclaimedWinnings),
          map((_result: any) => setHasWinnings()),
          catchError((_error) => {
            console.log(_error);
            return of(checkForWinningsFailure());
          })
        );
      }),
    )
  );

  Logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logoutUser),
      mergeMap(_ => {
        return this.contractService.clearProvider();
      })
    ),
    { dispatch: false }
  );

}
