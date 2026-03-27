import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { ParkingReservation } from '../../models/reservation.model';
import { ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-reservations-admin',
  templateUrl: './reservations-admin.component.html'
})
export class ReservationsAdminComponent implements OnInit {
  reservations: ParkingReservation[] = [];

  constructor(private reservationService: ReservationService, private cdr: ChangeDetectorRef) {}
  trackByReservation(index: number, item: any): number {
  return Number(item.id_reservation);
}

  statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe(data => this.reservations = data);
  }

  deleteReservation(id: number) {

  if (!confirm('Delete this reservation?')) return;

  this.reservationService.delete(id).subscribe({
    next: () => {

      console.log('Deleting ID:', id);

      // 🔥 FORCE FULL RELOAD (SAFE VERSION)
      this.reservationService.getAll().subscribe(data => {
        this.reservations = data;
        console.log('Updated list:', this.reservations);
      });

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