import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Slot } from '../models/slot.model';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private api = 'http://localhost:8082/api/parkingslots';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Slot[]> {
    return this.http.get<Slot[]>(this.api);
  }

  getById(id: number): Observable<Slot> {
    return this.http.get<Slot>(`${this.api}/${id}`);
  }

  getByZone(zoneId: number): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.api}/zone/${zoneId}`);
  }

  getAvailable(): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.api}/available`);
  }

  create(slot: Slot): Observable<Slot> {
    return this.http.post<Slot>(this.api, slot);
  }

  update(id: number, slot: Slot): Observable<Slot> {
    return this.http.put<Slot>(`${this.api}/${id}`, slot);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}