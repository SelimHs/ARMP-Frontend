import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private API = 'http://localhost:8082/api/parking-reservations';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.API);
  }

  create(reservation: any) {
    return this.http.post(this.API, reservation);
  }
}