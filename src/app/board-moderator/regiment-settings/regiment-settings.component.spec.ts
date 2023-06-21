import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegimentSettingsComponent } from './regiment-settings.component';

describe('RegimentSettingsComponent', () => {
  let component: RegimentSettingsComponent;
  let fixture: ComponentFixture<RegimentSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegimentSettingsComponent]
    });
    fixture = TestBed.createComponent(RegimentSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
