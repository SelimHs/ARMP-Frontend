import { Component, OnInit } from '@angular/core';
import { ZoneService } from '../services/zone.service';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html'
})
export class ZonesComponent implements OnInit {

  zones: any[] = [];

  constructor(private zoneService: ZoneService) {}

  ngOnInit(): void {
    this.zoneService.getAll().subscribe(data => {
      this.zones = data;
    });
  }
}