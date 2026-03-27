
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Zone } from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private api = 'http://localhost:8082/api/parkingzones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.api);
  }

  getById(id: number): Observable<Zone> {
    return this.http.get<Zone>(`${this.api}/${id}`);
  }

  create(zone: Zone): Observable<Zone> {
    return this.http.post<Zone>(this.api, zone);
  }

  update(id: number, zone: Zone): Observable<Zone> {
    return this.http.put<Zone>(`${this.api}/${id}`, zone);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

}
