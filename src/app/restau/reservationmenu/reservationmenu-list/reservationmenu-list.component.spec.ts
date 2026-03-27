import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationmenuListComponent } from './reservationmenu-list.component';

describe('ReservationmenuListComponent', () => {
  let component: ReservationmenuListComponent;
  let fixture: ComponentFixture<ReservationmenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationmenuListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationmenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
