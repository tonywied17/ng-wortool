import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWeaponsComponent } from './manage-weapons.component';

describe('ManageWeaponsComponent', () => {
  let component: ManageWeaponsComponent;
  let fixture: ComponentFixture<ManageWeaponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageWeaponsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWeaponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
