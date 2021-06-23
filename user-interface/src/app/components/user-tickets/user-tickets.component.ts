import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ContractService } from 'app/service/contract.service';
import { BehaviorSubject, combineLatest, forkJoin, from, interval, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { getDuraionToNextDraw } from 'app/store/selectors/helpers';
import { animate, style, transition, trigger } from '@angular/animations';
import {MatDialog} from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonUtil } from 'app/common.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as userTicketSelectors from 'app/store/selectors/user-ticket.selectors';
import * as usersSelectors from 'app/store/selectors/users.selectors';
import { loadUserTickets } from 'app/store/reducers/user-ticket.reducer';
import { TransferDialogComponent } from '../transfer-dialog/transfer-dialog.component';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { checkForWinnings } from 'app/store/reducers/lottery.reducer';

@Component({
  selector: 'app-user-tickets',
  templateUrl: './user-tickets.component.html',
  styleUrls: ['./user-tickets.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
  ]),
  ]
})
export class UserTicketsComponent implements OnDestroy {

  public unsubscriber$ = new Subject<any>();

  public loadingState$;
  public tickets$;
  public userAddress$;

  public buyForm: FormGroup;
  public claimFunds$ = new Subject<string>();

  constructor(private contractService: ContractService,
              private store: Store,
              private snackBar: MatSnackBar,
              public dialog: MatDialog) {
    this.store.dispatch(loadUserTickets());

    this.loadingState$ = this.store.select(userTicketSelectors.getLoadingState);
    this.tickets$ = this.store.select(userTicketSelectors.getTickets);

    this.userAddress$ = this.store.select(usersSelectors.getAccountAddress);

    this.setupClaimFunds();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  public formatAmountFromWei(value): string {
    return CommonUtil.formatAmount(CommonUtil.getNumber(value));
  }

  public transfer(ticketId) {
    const dialogRef = this.dialog.open(TransferDialogComponent, {
      data: { ticketId }
    });

    return dialogRef.afterClosed().subscribe();
  }

  public setupClaimFunds() {
    this.claimFunds$.pipe(
      takeUntil(this.unsubscriber$),
      withLatestFrom(this.userAddress$),
      mergeMap(([ticketId, address]) => {
        const obs$ = of({}).pipe(
          mergeMap(() => {
            const options = {
              gasPrice: 1000000000,
              gasLimit: 400000,
            };
            return this.contractService.getLotteryContract()
              .methods
              .claimFunds(ticketId)
              .send(options);
          }),
          mergeMap((result: any) => {
            return (result.status === 'rejected')
              ? throwError('rejected transaction')
              : of(result);
          }),
          tap(_result => {
            setTimeout(() => {
              this.snackBar.open(`Your Ticket Was Successfully Claimed`, 'Close');
              this.store.dispatch(loadUserTickets());
              this.store.dispatch(checkForWinnings());
            }, 1000);
          }),
          catchError(() => {
            this.snackBar.open('We were unable to claim your ticket, please refresh and try again.', 'Close', {
              panelClass: ['failure-snackbar']
            });
            return of(false);
          }));

        const dialogRef = this.dialog.open(ProgressDialogComponent, {
          data: {
            header: 'Claiming Ticket',
            observable: obs$,
            message: 'Claiming Ticket'
           }
        });
        return dialogRef.afterClosed();
      })
    )
    .subscribe();
  }

}
