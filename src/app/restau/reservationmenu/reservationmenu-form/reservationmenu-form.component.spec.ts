import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationmenuFormComponent } from './reservationmenu-form.component';

describe('ReservationmenuFormComponent', () => {
  let component: ReservationmenuFormComponent;
  let fixture: ComponentFixture<ReservationmenuFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationmenuFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationmenuFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
