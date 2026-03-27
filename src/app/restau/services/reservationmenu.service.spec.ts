import { TestBed } from '@angular/core/testing';

import { ReservationmenuService } from './reservationmenu.service';

describe('ReservationmenuService', () => {
  let service: ReservationmenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationmenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
