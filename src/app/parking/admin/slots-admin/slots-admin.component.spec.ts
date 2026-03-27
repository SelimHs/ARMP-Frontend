import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotsAdminComponent } from './slots-admin.component';

describe('SlotsAdminComponent', () => {
  let component: SlotsAdminComponent;
  let fixture: ComponentFixture<SlotsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlotsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
