import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamIdsComponent } from './steam-ids.component';

describe('SteamIdsComponent', () => {
  let component: SteamIdsComponent;
  let fixture: ComponentFixture<SteamIdsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SteamIdsComponent]
    });
    fixture = TestBed.createComponent(SteamIdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
