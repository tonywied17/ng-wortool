import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegimentInfoComponent } from './regiment-info.component';

describe('RegimentInfoComponent', () => {
  let component: RegimentInfoComponent;
  let fixture: ComponentFixture<RegimentInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegimentInfoComponent]
    });
    fixture = TestBed.createComponent(RegimentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
