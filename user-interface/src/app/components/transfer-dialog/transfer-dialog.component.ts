import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { CONTRACT_ADDRESS } from 'app/app.constants';
import { ContractService } from 'app/service/contract.service';
import { loadCurrentContractAllowanceSuccess } from 'app/store/reducers/lottery.reducer';
import { loadUserTickets } from 'app/store/reducers/user-ticket.reducer';
import { getAccountAddress } from 'app/store/selectors/users.selectors';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { take } from 'rxjs/operators';
import Web3 from 'web3';
const utils = require('@harmony-js/utils');

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.scss']
})
export class TransferDialogComponent implements OnInit {

  private lotteryContract;

  public accountAddress = null;
  public ticketId = null;

  public transferForm: FormGroup;

  public submitLoader$ = new BehaviorSubject<string>('idle');

  constructor(contractService: ContractService,
              private store: Store,
              @Inject(MAT_DIALOG_DATA) data,
              private dialogRef: MatDialogRef<TransferDialogComponent>,
              formBuilder: FormBuilder) {
    this.ticketId = data.ticketId;

    this.transferForm = formBuilder.group({
      targetAddress: new FormControl('', [Validators.required, this.addressValidator()]),
    });

    store.select(getAccountAddress).pipe(take(1))
      .subscribe((accountAddress) => {
        this.accountAddress = accountAddress;
      });

    this.lotteryContract = contractService.getLotteryContract();
  }

  ngOnInit(): void {
  }

  transfer() {
    this.transferForm.markAllAsTouched();

    if (!this.transferForm.invalid) {
      this.runTransfer();
    }
  }

  async runTransfer() {
    const targetAddress = this.transferForm.controls.targetAddress.value;

    this.submitLoader$.next('pending');

    try {
      const options = {
        gasPrice: 1000000000,
        gasLimit: 400000,
      };

      const result = await this.lotteryContract
          .methods
          .safeTransferFrom(this.accountAddress, targetAddress, this.ticketId)
          .send(options);

      if (result.status === 'rejected') {
        throw new Error('transaction rejected');
      }

      this.submitLoader$.next('success');

      setTimeout(_ => {
        this.store.dispatch(loadUserTickets());

        this.dialogRef.close({ status: true });
      }, 1000);

    }
    catch (e) {
      console.error(e);
      this.submitLoader$.next('error');
    }
  }

  addressValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      try {
        const aa = utils;
        const isAddress = utils.isValidAddress(control.value);
        return (!isAddress)
          ? {addressNotValid: {value: control.value}}
          : null;
      } catch (e) {
        return {addressNotValid: {value: control.value}};
      }
    };
  }



}
