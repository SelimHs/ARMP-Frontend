import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { ParkingReservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservations-admin',
  templateUrl: './reservations-admin.component.html'
})
export class ReservationsAdminComponent implements OnInit {
  reservations: ParkingReservation[] = [];

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe(data => this.reservations = data);
  }

  deleteReservation(id?: number): void {
    if (!id) return;
    this.reservationService.delete(id).subscribe(() => this.loadReservations());
  }
}