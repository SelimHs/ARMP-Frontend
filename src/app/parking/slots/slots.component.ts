import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Slot } from '../models/slot.model';
import { SlotService } from '../services/slot.service';

@Component({
  selector: 'app-slots',
  templateUrl: './slots.component.html',
  styleUrls: ['./slots.component.css']
})
export class SlotsComponent implements OnInit {

  slots: Slot[] = [];
  zoneId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private slotService: SlotService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.zoneId = +params['zoneId'];
      if (this.zoneId) {
        this.loadSlots();
      }
    });
  }

  loadSlots(): void {
    this.slotService.getByZone(this.zoneId).subscribe({
      next: (data) => this.slots = data,
      error: (err) => console.error(err)
    });
  }

  reserve(slotId?: number): void {
    if (!slotId) return;
    this.router.navigate(['/parking/reservations'], { queryParams: { slotId } });
  }
}