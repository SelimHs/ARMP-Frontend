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

  statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe(data => this.reservations = data);
  }

  deleteReservation(id?: number) {
  if (!id) return;

  if (!confirm('Delete this reservation?')) return;

  this.reservationService.delete(id).subscribe({
    next: () => {
      console.log('Deleted');

      // 🔥 REMOVE FROM UI INSTANTLY
      this.reservations = this.reservations.filter(
        r => r.id_reservation !== id
      );
    },
    error: (err) => console.error(err)
  });
}


updateStatus(id?: number, newStatus?: string) {
  if (!id || !newStatus) return;

  const cleanStatus = newStatus.trim().toUpperCase();

  this.reservationService.updateStatus(id, cleanStatus).subscribe({
    next: () => this.loadReservations(),
    error: (err) => console.error(err)
  });
}
}