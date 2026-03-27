import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
private API = 'http://localhost:8082/api/parking-slots';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.API);
  }

  getByZone(zoneId: number) {
    return this.http.get<any[]>(`${this.API}/zone/${zoneId}`);
  }
  
}
