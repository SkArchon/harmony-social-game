import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { CommonUtil } from 'app/common.util';
import { loadLotteryDraws } from 'app/store/reducers/lottery-draws.reducer';
import * as lotteryDrawSelectors from 'app/store/selectors/lottery-draws.selectors';
import { Subject } from 'rxjs';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-lottery-draws',
  templateUrl: './lottery-draws.component.html',
  styleUrls: ['./lottery-draws.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
    ]),
  ]
})
export class LotteryDrawsComponent implements OnDestroy {

  public unsubscriber$ = new Subject<any>();

  public loadingState$;
  public draws$;

  constructor(private store: Store,
              public dialog: MatDialog) {
    this.store.dispatch(loadLotteryDraws());

    this.loadingState$ = this.store.select(lotteryDrawSelectors.getLoadingState);
    this.draws$ = this.store.select(lotteryDrawSelectors.getDraws);
  }

  public formatDate(timestamp): string {
    return DateTime.fromSeconds(timestamp).toFormat('yyyy LLL dd');
  }

  public formatAmount(value): string {
    return CommonUtil.formatAmount(value);
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

}
