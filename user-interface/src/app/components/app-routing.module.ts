import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LotteryDrawsComponent } from './lottery-draws/lottery-draws.component';
import { UserTicketsComponent } from './user-tickets/user-tickets.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'tickets',
    component: UserTicketsComponent
  },
  {
    path: 'draws',
    component: LotteryDrawsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
