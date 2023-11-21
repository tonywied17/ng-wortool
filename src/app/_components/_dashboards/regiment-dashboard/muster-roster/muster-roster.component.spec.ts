import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusterRosterComponent } from './muster-roster.component';

describe('MusterRosterComponent', () => {
  let component: MusterRosterComponent;
  let fixture: ComponentFixture<MusterRosterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MusterRosterComponent]
    });
    fixture = TestBed.createComponent(MusterRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
