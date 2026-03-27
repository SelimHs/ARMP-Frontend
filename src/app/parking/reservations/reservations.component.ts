import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParkingReservation } from '../models/reservation.model';
import { ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  slotId!: number;
  userId = 1;

  form: ParkingReservation = {
    userId: 1,
    slotId: 0,
    start_time: '',
    end_time: '',
    status: 'PENDING'
  };

  myReservations: ParkingReservation[] = [];

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.slotId = +params['slotId'];
      if (this.slotId) {
        this.form.slotId = this.slotId;
      }
    });

    this.loadMyReservations();
  }

  reserve(): void {
    this.form.userId = this.userId;

    this.reservationService.create(this.form).subscribe({
      next: () => {
        alert('Reservation created successfully');
        this.form.start_time = '';
        this.form.end_time = '';
        this.loadMyReservations();
      },
      error: (err) => {
        console.error(err);
        alert(err.error || 'Reservation failed');
      }
    });
  }

  loadMyReservations(): void {
    this.reservationService.getByUser(this.userId).subscribe({
      next: (data) => this.myReservations = data,
      error: (err) => console.error(err)
    });
  }

  cancelReservation(id?: number): void {
    if (!id) return;

    this.reservationService.delete(id).subscribe({
      next: () => this.loadMyReservations(),
      error: (err) => console.error(err)
    });
  }
}