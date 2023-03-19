import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusterComponent } from './muster.component';

describe('MusterComponent', () => {
  let component: MusterComponent;
  let fixture: ComponentFixture<MusterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MusterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
