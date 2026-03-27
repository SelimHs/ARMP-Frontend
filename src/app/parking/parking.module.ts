import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParkingRoutingModule } from './parking-routing.module';
import { ParkingComponent } from './parking.component';
import { ZonesComponent } from './zones/zones.component';
import { SlotsComponent } from './slots/slots.component';
import { ReservationsComponent } from './reservations/reservations.component';


@NgModule({
  declarations: [
    ParkingComponent,
    ZonesComponent,
    SlotsComponent,
    ReservationsComponent
  ],
  imports: [
    CommonModule,
    ParkingRoutingModule
  ]
})
export class ParkingModule { }
