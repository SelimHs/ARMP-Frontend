import { Component, OnInit } from '@angular/core';
import { Zone } from '../../models/zone.model';
import { ZoneService } from '../../services/zone.service';

@Component({
  selector: 'app-zones-admin',
  templateUrl: './zones-admin.component.html'
})
export class ZonesAdminComponent implements OnInit {
  zones: Zone[] = [];
  form: Zone = { name: '', location: '', description: '' };
  editingId: number | null = null;

  constructor(private zoneService: ZoneService) {}

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones(): void {
    this.zoneService.getAll().subscribe(data => this.zones = data);
  }

  saveZone(): void {
    if (this.editingId) {
      this.zoneService.update(this.editingId, this.form).subscribe(() => {
        this.resetForm();
        this.loadZones();
      });
    } else {
      this.zoneService.create(this.form).subscribe(() => {
        this.resetForm();
        this.loadZones();
      });
    }
  }

  editZone(zone: Zone): void {
    this.form = { ...zone };
    this.editingId = zone.id_zone || null;
  }

  deleteZone(id?: number): void {
    if (!id) return;
    this.zoneService.delete(id).subscribe(() => this.loadZones());
  }

  resetForm(): void {
    this.form = { name: '', location: '', description: '' };
    this.editingId = null;
  }
}