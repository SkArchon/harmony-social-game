import { Component, OnDestroy } from '@angular/core';
import { ContractService } from '../service/contract.service';
import { Store } from '@ngrx/store';
import { getAccountAddress, getAccountAddressShortened } from '../store/selectors/users.selectors';
import { from, interval, Observable, of, Subject } from 'rxjs';
import { logoutUser } from '../store/reducers/user.reducer';
import { catchError, filter, map, mergeMap, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  public startDraw$ = new Subject<void>();

  public accountAddress$: Observable<string>;

  public remainingTime$ = new Subject<any>();
  public unsubscriber$ = new Subject<any>();

  constructor(private contractService: ContractService,
              private snackBar: MatSnackBar,
              private store: Store) {
    this.accountAddress$ = this.store.select(getAccountAddressShortened);

    this.startDraw$.pipe(
      mergeMap(_ => {
        const options = {
          gasPrice: 10000000000,
          gasLimit: 2100000,
        };
        const promise = this.contractService.getLotteryContract()
          .methods
          .processDraw()
          .send(options);

        return from(promise);
      }),
      catchError(_ => {
        console.log(_);
        return of({});
      })
    ).subscribe((_success: any) => {
      console.log(`https://explorer.testnet.harmony.one/#/tx/${_success.transaction.id}`);
      console.log('SUCCESS');
    });
  }

  public signIn(): any {
    this.contractService.connectWallet();
  }

  public logout(): any {
    this.store.dispatch(logoutUser());
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


}
