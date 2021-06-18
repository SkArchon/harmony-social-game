import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './components/app-routing.module';
import { AppComponent } from './components/app.component';
import { HomeComponent } from './components/home/home.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store/reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './store/effects/app.effects';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import { UserTicketsComponent } from './components/user-tickets/user-tickets.component';
import { TransferDialogComponent } from './components/transfer-dialog/transfer-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { LotteryDrawsComponent } from './components/lottery-draws/lottery-draws.component';
import { ProgressDialogComponent } from './components/progress-dialog/progress-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    UserTicketsComponent,
    HomeComponent,
    TransferDialogComponent,
    LotteryDrawsComponent,
    ProgressDialogComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    AppRoutingModule,
    StoreModule.forRoot({}, {}),
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({ maxAge: 50 }),
    // !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects]),
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    TransferDialogComponent
  ],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {duration: 5 * 1000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['success-snackbar'] }
    }
  ]
})
export class AppModule { }
