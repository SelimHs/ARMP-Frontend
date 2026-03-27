import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParkingComponent } from './parking.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { SlotsComponent } from './slots/slots.component';
import { ZonesComponent } from './zones/zones.component';

const routes: Routes = [
  { path: 'zones', component: ZonesComponent },
  { path: 'slots', component: SlotsComponent },
  { path: 'reservations', component: ReservationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParkingRoutingModule { }
