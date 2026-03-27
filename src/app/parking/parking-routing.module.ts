import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ZonesAdminComponent } from './admin/zones-admin/zones-admin.component';
import { SlotsAdminComponent } from './admin/slots-admin/slots-admin.component';
import { ReservationsAdminComponent } from './admin/reservations-admin/reservations-admin.component';

import { ZonesComponent } from './zones/zones.component';
import { SlotsComponent } from './slots/slots.component';
import { ReservationsComponent } from './reservations/reservations.component';

const routes: Routes = [
  { path: 'admin/zones', component: ZonesAdminComponent },
  { path: 'admin/slots', component: SlotsAdminComponent },
  { path: 'admin/reservations', component: ReservationsAdminComponent },

  { path: 'zones', component: ZonesComponent },
  { path: 'slots', component: SlotsComponent },
  { path: 'reservations', component: ReservationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParkingRoutingModule {}