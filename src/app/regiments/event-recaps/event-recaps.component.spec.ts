import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRecapsComponent } from './event-recaps.component';

describe('EventRecapsComponent', () => {
  let component: EventRecapsComponent;
  let fixture: ComponentFixture<EventRecapsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventRecapsComponent]
    });
    fixture = TestBed.createComponent(EventRecapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
