import { Injectable } from '@angular/core';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { from, fromEvent, of, Subject, throwError, timer } from 'rxjs';
import { catchError, delay, filter, map, retryWhen, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { DateTime } from 'luxon';
import { Store } from '@ngrx/store';
import { logoutUser, setAccountAddress } from '../store/reducers/user.reducer';
import { CONTRACT_ADDRESS, HARMONY_URL } from '../app.constants';
import { getAccountAddress } from '../store/selectors/users.selectors';
import { CommonUtil } from 'app/common.util';
import { loadUserTickets } from 'app/store/reducers/user-ticket.reducer';
import Pool from 'contracts/Pool.json';
import { checkForWinnings, lotteryLoadData } from 'app/store/reducers/lottery.reducer';
import { timeBasedRetryStrategy } from 'app/common.operators';
import { MatSnackBar } from '@angular/material/snack-bar';
const { Harmony } = require('@harmony-js/core');
const { ChainType } = require('@harmony-js/utils');

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private lotteryContract = null;
  private harmony = null;
  private onewallet = null;

  private accountStatusSource = new Subject<any>();
  accountStatus$ = this.accountStatusSource.asObservable();

  logoutEvent$ = new Subject<void>();

  private readonly MAX_TIMER_COUNT = 20;

  constructor(private store: Store, private snackBar: MatSnackBar) {
    this.initializeContracts();
    this.setupWalletLoginIfAccountAddressCached();
  }

  private setupWalletLoginIfAccountAddressCached() {
    this.store.select(getAccountAddress)
      .pipe(
        take(1),
        filter(address => !!address),
        tap(address => {
          // We pre-setup the signing contract, this is to handle any scenarios where for example
          // the user is logged in but the wallet is still initiating
          // which would be handled by the wait timer inside the signing callback
          this.setupSigningContract(address);
        }),
        switchMap(_address => this.connectWallet())
      )
      .subscribe();
  }

  public connectWallet() {
    const setupProviderAndLogin = (account) => {
      this.onewallet = (window as any).onewallet;
      this.setupSigningContract(account.address);

      this.store.dispatch(setAccountAddress({ accountAddress: account.address }));
      this.store.dispatch(loadUserTickets());
      this.store.dispatch(checkForWinnings());
      this.store.dispatch(lotteryLoadData());
    };

    return this.waitAndGetWallet().pipe(
      switchMap(_ => {
        const onewallet = (window as any).onewallet;
        return from(onewallet.getAccount());
      }),
      switchMap((account: any) => {
        if (!account?.address) {
          this.lotteryContract.wallet.signTransaction = null;
          return throwError('Could not login');
        }
        setupProviderAndLogin(account);
        return of(true);
      })
    );
  }

  private waitAndGetWallet() {
    const getWalletIfExists = map(_ => {
        const onewallet = (window as any).onewallet;
        if (!onewallet) {
          throw new Error('One Wallet Not Found');
        }
        return onewallet;
      });

    return of({}).pipe(
      getWalletIfExists,
      retryWhen(timeBasedRetryStrategy(6, 500))
    );
  }

  private setupSigningContract(accountAddress) {
    this.lotteryContract.wallet.signTransaction = async (tx) => {
      tx.from = accountAddress;

      if (this.onewallet) {
        return await this.onewallet.signTransaction(tx);
      }

      // This is to allow a pre-logged in user to perform
      // a transaction before the wallet has initialized
      const awaitOneWalletTimer = timer(0, 500).pipe(
          switchMap(count => {
            return (count > this.MAX_TIMER_COUNT)
              ? throwError('Wait time exceeded')
              : of(count);
          }),
          // Wait until the onewallet is intiated
          filter(_ => !!this.onewallet),
          take(1),
          map(_ => this.onewallet)
        ).toPromise();
      const processOneWallet = await awaitOneWalletTimer;
      return await processOneWallet.signTransaction(tx);
    };
  }

  private initializeContracts(): void {
    this.harmony = new Harmony(HARMONY_URL, { chainType: ChainType.Harmony, chainId: 2 });
    this.lotteryContract = this.harmony.contracts.createContract(Pool.abi, CONTRACT_ADDRESS);
  }

  public getLotteryContract(): any {
    return this.lotteryContract;
  }

  public async clearProvider() {
    await (window as any).onewallet.forgetIdentity();
    localStorage.clear();
  }

}
