import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { CONTRACT_ADDRESS } from 'app/app.constants';
import { ContractService } from 'app/service/contract.service';
import { take } from 'rxjs/operators';
import Web3 from 'web3';

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent {

  public header = '';
  public message = '';

  constructor(contractService: ContractService,
              private store: Store,
              @Inject(MAT_DIALOG_DATA) data,
              private dialogRef: MatDialogRef<ProgressDialogComponent>,
              formBuilder: FormBuilder) {
    this.header = data.header;
    this.message = data.message;
    data.observable.subscribe(_ => {
      this.dialogRef.close();
    }, _ => {
      this.dialogRef.close();
    });
  }


 

}
