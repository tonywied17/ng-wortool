import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamStatsComponent } from './steam-stats.component';

describe('SteamStatsComponent', () => {
  let component: SteamStatsComponent;
  let fixture: ComponentFixture<SteamStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SteamStatsComponent]
    });
    fixture = TestBed.createComponent(SteamStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
