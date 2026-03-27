import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParkingReservation } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private api = 'http://localhost:8082/api/parkingreservations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ParkingReservation[]> {
    return this.http.get<ParkingReservation[]>(this.api);
  }

  getById(id: number): Observable<ParkingReservation> {
    return this.http.get<ParkingReservation>(`${this.api}/${id}`);
  }

  getByUser(userId: number): Observable<ParkingReservation[]> {
    return this.http.get<ParkingReservation[]>(`${this.api}/user/${userId}`);
  }

  create(reservation: ParkingReservation): Observable<ParkingReservation> {
    return this.http.post<ParkingReservation>(this.api, reservation);
  }

  update(id: number, reservation: ParkingReservation): Observable<ParkingReservation> {
    return this.http.put<ParkingReservation>(`${this.api}/${id}`, reservation);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}