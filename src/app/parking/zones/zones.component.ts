import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Zone } from '../models/zone.model';
import { ZoneService } from '../services/zone.service';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.css']
})
export class ZonesComponent implements OnInit {

  zones: Zone[] = [];

  constructor(
    private zoneService: ZoneService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones(): void {
    this.zoneService.getAll().subscribe({
      next: (data) => this.zones = data,
      error: (err) => console.error(err)
    });
  }

  openSlots(zoneId?: number): void {
    if (!zoneId) return;
    this.router.navigate(['/parking/slots'], { queryParams: { zoneId } });
  }
}