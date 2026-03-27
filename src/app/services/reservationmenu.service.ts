import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationMenu, ReservationMenuRequest, AvailabilityResponse } from '../models/reservationmenu';

@Injectable({
  providedIn: 'root'
})
export class ReservationMenuService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  getAllReservationMenus(): Observable<ReservationMenu[]> {
    return this.http.get<ReservationMenu[]>(`${this.apiUrl}/reservationmenus`);
  }

  getReservationMenuById(id: number): Observable<ReservationMenu> {
    return this.http.get<ReservationMenu>(`${this.apiUrl}/reservationmenus/${id}`);
  }

  getReservationMenusByUser(userId: number): Observable<ReservationMenu[]> {
    return this.http.get<ReservationMenu[]>(`${this.apiUrl}/reservationmenus/user/${userId}`);
  }

  createReservationMenu(request: ReservationMenuRequest): Observable<ReservationMenu> {
    return this.http.post<ReservationMenu>(`${this.apiUrl}/reservationmenus`, request);
  }

  updateReservationMenu(id: number, request: ReservationMenuRequest): Observable<ReservationMenu> {
    return this.http.put<ReservationMenu>(`${this.apiUrl}/reservationmenus/${id}`, request);
  }

  deleteReservationMenu(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/reservationmenus/${id}`, { responseType: 'text' });
  }

  // Vérifier la disponibilité
  checkAvailability(menuId: number, date: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/reservationmenus/check-availability?menuId=${menuId}&date=${date}`);
  }

  testReservationMenu(): Observable<ReservationMenu> {
    return this.http.post<ReservationMenu>(`${this.apiUrl}/reservationmenus/test`, {});
  } 
  
}