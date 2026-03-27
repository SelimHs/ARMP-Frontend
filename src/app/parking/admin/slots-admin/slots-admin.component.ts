import { Component, OnInit } from '@angular/core';
import { Slot } from '../../models/slot.model';
import { Zone } from '../../models/zone.model';
import { SlotService } from '../../services/slot.service';
import { ZoneService } from '../../services/zone.service';

@Component({
  selector: 'app-slots-admin',
  templateUrl: './slots-admin.component.html'
})
export class SlotsAdminComponent implements OnInit {
  slots: Slot[] = [];
  zones: Zone[] = [];

  form: Slot = {
    slot_number: '',
    is_covered: false,
    is_ev_charging: false,
    is_available: true,
    zoneId: undefined
  };

  editingId: number | null = null;

  constructor(
    private slotService: SlotService,
    private zoneService: ZoneService
  ) {}

  ngOnInit(): void {
    this.loadSlots();
    this.loadZones();
  }

  loadSlots(): void {
    this.slotService.getAll().subscribe(data => this.slots = data);
  }

  loadZones(): void {
    this.zoneService.getAll().subscribe(data => this.zones = data);
  }

  saveSlot(): void {
    if (this.editingId) {
      this.slotService.update(this.editingId, this.form).subscribe(() => {
        this.resetForm();
        this.loadSlots();
      });
    } else {
      this.slotService.create(this.form).subscribe(() => {
        this.resetForm();
        this.loadSlots();
      });
    }
  }

  editSlot(slot: Slot): void {
    this.form = {
      slot_number: slot.slot_number,
      is_covered: slot.is_covered,
      is_ev_charging: slot.is_ev_charging,
      is_available: slot.is_available,
      zoneId: slot.zone?.id_zone
    };
    this.editingId = slot.id_slot || null;
  }

  deleteSlot(id?: number): void {
    if (!id) return;
    this.slotService.delete(id).subscribe(() => this.loadSlots());
  }

  resetForm(): void {
    this.form = {
      slot_number: '',
      is_covered: false,
      is_ev_charging: false,
      is_available: true,
      zoneId: undefined
    };
    this.editingId = null;
  }
}