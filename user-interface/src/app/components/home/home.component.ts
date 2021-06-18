import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { CommonUtil } from 'app/common.util';
import { ContractService } from 'app/service/contract.service';
import { loadLotteryDraws } from 'app/store/reducers/lottery-draws.reducer';
import { lotteryLoadData } from 'app/store/reducers/lottery.reducer';
import { loadUserTickets } from 'app/store/reducers/user-ticket.reducer';
import * as lotteryDrawSelectors from 'app/store/selectors/lottery-draws.selectors';
import { getCurrentParticipants, getDrawNumber, getDrawPoolFormatted, getEnteredCurrentDraw, getHasWinnings, getIsDrawExpired, 
  getLoadingState, getMaxParticipants, getTicketPrice, getTicketPriceFormatted, getUserBalance } from 'app/store/selectors/lottery.selectors';
import * as userTicketSelectors from 'app/store/selectors/user-ticket.selectors';
import { getAccountAddress } from 'app/store/selectors/users.selectors';
import { from, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

const { Units, Unit, numberToString, add0xToString, fromWei, toWei, numToStr} = require('@harmony-js/utils');
const BN = require('bn.js');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
  ]),
  ]
})
export class HomeComponent implements OnDestroy {

  public unsubscriber$ = new Subject<any>();
  public remainingTime$ = new Subject<any>();
  public purchaseSubmit$ = new Subject<void>();
  public isDrawExpired$;

  // This should be the same as in the contract
  // since both are constants we dont retrieve them from the contract
  public readonly maxTicketsPerPurchase = 100;

  public currentParticipants$;
  public maxParticipants$;
  public loadingState$;
  public drawNumber$;
  public drawPoolFormatted$;
  public ticketPrice$: Observable<number>;
  public ticketPriceFormatted$;
  public caluclatedPrice$;
  public hasWinnings$;
  public accountAddress$;

  public lotteryDrawLoadingState$;
  public draws$;

  public userTicketsLoadingState$;
  public userTickets$;

  public userBalance$;
  public enteredCurrentDraw$;

  // workaround since async validator didnt work with withLatestFrom
  public userBalanceValue = null;
  public ticketPriceValue = null;

  constructor(private contractService: ContractService,
              private snackBar: MatSnackBar,
              private store: Store,
              public dialog: MatDialog,
              formBuilder: FormBuilder) {
    this.store.dispatch(lotteryLoadData());
    this.store.dispatch(loadUserTickets());
    this.store.dispatch(loadLotteryDraws());

    this.currentParticipants$ = this.store.select(getCurrentParticipants);
    this.maxParticipants$ = this.store.select(getMaxParticipants);
    this.drawNumber$ = this.store.select(getDrawNumber);
    this.drawPoolFormatted$ = this.store.select(getDrawPoolFormatted);
    this.ticketPrice$ = this.store.select(getTicketPrice);
    this.ticketPriceFormatted$ = this.store.select(getTicketPriceFormatted);
    this.hasWinnings$ = this.store.select(getHasWinnings);
    this.userBalance$ = this.store.select(getUserBalance);
    this.accountAddress$ = this.store.select(getAccountAddress);
    this.isDrawExpired$ = this.store.select(getIsDrawExpired);
    this.enteredCurrentDraw$ = this.store.select(getEnteredCurrentDraw);

    this.draws$ = this.store.select(lotteryDrawSelectors.getFirstThreeDraws);
    this.lotteryDrawLoadingState$ = this.store.select(lotteryDrawSelectors.getLoadingState)
      .pipe(startWith('pending'));

    this.userTickets$ = this.store.select(userTicketSelectors.getFirstThreeTickets);
    this.userTicketsLoadingState$ = this.store.select(userTicketSelectors.getLoadingState)
       .pipe(startWith('pending'));

    this.loadingState$ = this.store.select(getLoadingState)
      .pipe(startWith('pending'));

    this.userBalance$.subscribe((userBalanceAsValue) => {
      this.userBalanceValue = userBalanceAsValue;
    });

    this.ticketPrice$.subscribe((ticketPriceValue) => {
      this.ticketPriceValue = ticketPriceValue;
    });
    this.setupBuyButton();
  }

  private setupBuyButton() {
    this.purchaseSubmit$.pipe(
      takeUntil(this.unsubscriber$),
      withLatestFrom(this.store.select(getAccountAddress)),
      filter(([_, accountAddress]) => {
        if (accountAddress) {
          return true;
        }
        this.snackBar.open('Please sign in using the "Sign In" button at the top right hand corner first', 'Close', {
          panelClass: ['failure-snackbar']
        });
        return false;
      }),
      switchMap(_ => {
        return of({}).pipe(
          withLatestFrom(this.drawNumber$, this.store.select(getAccountAddress)),
          switchMap(([_v, localDrawNumber, accountAddress]) => {
            const promise = this.contractService.getLotteryContract()
              .methods
              .getDetails(accountAddress)
              .call();

            return from(promise).pipe(
              map((result: any) => {
                return (Number(localDrawNumber) === localDrawNumber)
                  ? 'success'
                  : 'failure';
              }),
              catchError(_error => {
                return of('error');
              })
            );
          })
        );
      }),
      filter(result => {
        switch (result) {
          case 'error':
            this.snackBar.open('An unexpected exception happened when validating the draw.', 'Close', {
              panelClass: ['failure-snackbar']
            });
            return false;
          case 'failure':
            this.snackBar.open('It seems like the draw has expired, please refresh and purchase.', 'Close', {
              panelClass: ['failure-snackbar']
            });
            return false;
          default:
            return true;
        }
      }),
      withLatestFrom(this.store.select(getAccountAddress), this.drawNumber$, this.ticketPrice$),
      mergeMap(([_, accountAddress, drawNumber, ticketPrice]) => {
        const options = {
          gasPrice: 1000000000,
          gasLimit: 400000,
          value: toWei(ticketPrice, 'one')
        };

        const promise = this.contractService.getLotteryContract()
          .methods
          .buyTicket(drawNumber)
          .send(options);

        const obs$ = of({}).pipe(
          mergeMap(() => from(promise)),
          mergeMap((result: any) => {
            return (result.status === 'rejected')
              ? throwError('rejected transaction')
              : of(result);
          }),
          tap((_success: any) => {
            console.log(`https://explorer.testnet.harmony.one/#/tx/${_success.transaction.id}`);
            setTimeout(() => {
              this.snackBar.open(`Ticket Was Successfully Purchased`, 'Close');
              this.store.dispatch(lotteryLoadData());
              this.store.dispatch(loadUserTickets());
            }, 1000);
          }),
          catchError(_error => {
            setTimeout(() => {
              this.store.dispatch(lotteryLoadData());
              this.store.dispatch(loadUserTickets());
            }, 1000);

            this.snackBar.open('We were unable to buy the tickets required', 'Close', {
              panelClass: ['failure-snackbar']
            });
            return of(false);
          })
        );

        const dialogRef = this.dialog.open(ProgressDialogComponent, {
          data: {
            header: 'Purchasing Tickets',
            observable: obs$,
            message: 'Purchasing Tickets'
           }
        });
        return dialogRef.afterClosed();
      })
    )
    .subscribe();
  }

  public formatAmount(value): string {
    return CommonUtil.formatAmount(value);
  }

  public formatAmountFromWei(value): string {
    return CommonUtil.formatAmount(CommonUtil.getNumber(value));
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

}
