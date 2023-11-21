import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnlisterComponent } from './enlister.component';

describe('EnlisterComponent', () => {
  let component: EnlisterComponent;
  let fixture: ComponentFixture<EnlisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnlisterComponent]
    });
    fixture = TestBed.createComponent(EnlisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
