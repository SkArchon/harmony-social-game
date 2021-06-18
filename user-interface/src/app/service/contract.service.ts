import { Injectable } from '@angular/core';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { from, fromEvent, of, Subject } from 'rxjs';
import { delay, filter, map, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { DateTime } from 'luxon';
import { Store } from '@ngrx/store';
import { logoutUser, setAccountAddress } from '../store/reducers/user.reducer';
import { CONTRACT_ADDRESS } from '../app.constants';
import { getAccountAddress } from '../store/selectors/users.selectors';
import { CommonUtil } from 'app/common.util';
import { loadUserTickets } from 'app/store/reducers/user-ticket.reducer';
import Pool from 'contracts/Pool.json';
import { checkForWinnings, lotteryLoadData } from 'app/store/reducers/lottery.reducer';
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

  constructor(private store: Store) {
    // setTimeout(async () => {
    //   const contract = await this.initializeContract();
    //   console.log(contract);

    //   const value = await contract.methods.getDetails().call();
    //   console.log(value);
    // }, 2000);
    this.initializeContracts();

    this.store.select(getAccountAddress)
      .pipe(
        take(1),
        filter(address => !!address),
        delay(2000) // TODO : Update
      )
      .subscribe(_ => {
        this.connectWallet();
      });
  }
  async connectWallet(): Promise<void> {
    await this.processProvider();
  }

  async processProvider(): Promise<void> {
      const onewallet = (window as any).onewallet;
      const account = await onewallet.getAccount();
      if (account?.address) {
        this.onewallet = onewallet;
        this.setupSigningContract(account.address);

        this.store.dispatch(setAccountAddress({ accountAddress: account.address }));
        this.store.dispatch(loadUserTickets());
        this.store.dispatch(checkForWinnings());
        this.store.dispatch(lotteryLoadData());
      }
  }

  private setupSigningContract(accountAddress) {
    this.lotteryContract.wallet.signTransaction = async (tx) => {
      tx.from = accountAddress;
      const signTx = await this.onewallet.signTransaction(tx);
      console.log(signTx);
      return signTx;
    };
  }

  private initializeContracts(): void {
    this.harmony = new Harmony('https://api.s0.b.hmny.io', { chainType: ChainType.Harmony, chainId: 2 });
    this.lotteryContract = this.harmony.contracts.createContract(Pool.abi, CONTRACT_ADDRESS);
  }

  public getHarmony() {
    return this.harmony;
  }

  public getLotteryContract(): any {
    return this.lotteryContract;
  }

  public getUsdContract(): any {
    return null;
  }

  public async clearProvider() {
    await (window as any).onewallet.forgetIdentity();
    localStorage.clear();
  }

}
