
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private API = 'http://localhost:8082/api/parkingzones';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.API);
  }

  create(zone: any) {
    return this.http.post(this.API, zone);
  }

}
