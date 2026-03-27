import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParkingRoutingModule } from './parking-routing.module';
import { ParkingComponent } from './parking.component';
import { ZonesComponent } from './zones/zones.component';
import { SlotsComponent } from './slots/slots.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ZonesAdminComponent } from './admin/zones-admin/zones-admin.component';
import { SlotsAdminComponent } from './admin/slots-admin/slots-admin.component';
import { ReservationsAdminComponent } from './admin/reservations-admin/reservations-admin.component';


@NgModule({
  declarations: [
    ParkingComponent,
    ZonesComponent,
    SlotsComponent,
    ReservationsComponent,
    ZonesAdminComponent,
    SlotsAdminComponent,
    ReservationsAdminComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ParkingRoutingModule
  ]
})
export class ParkingModule { }
