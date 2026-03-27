import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuUserListComponent } from './menu-user-list.component';

describe('MenuUserListComponent', () => {
  let component: MenuUserListComponent;
  let fixture: ComponentFixture<MenuUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuUserListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
