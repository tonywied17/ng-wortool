import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegimentsComponent } from './regiments.component';

describe('RegimentsComponent', () => {
  let component: RegimentsComponent;
  let fixture: ComponentFixture<RegimentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegimentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegimentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
