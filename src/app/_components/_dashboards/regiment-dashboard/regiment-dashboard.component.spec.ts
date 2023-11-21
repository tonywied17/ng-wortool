import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegimentDashboardComponent } from './regiment-dashboard.component';

describe('RegimentDashboardComponent', () => {
  let component: RegimentDashboardComponent;
  let fixture: ComponentFixture<RegimentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegimentDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegimentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
