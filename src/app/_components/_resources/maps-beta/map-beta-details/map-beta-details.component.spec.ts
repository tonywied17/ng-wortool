import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBetaDetailsComponent } from './map-beta-details.component';

describe('MapBetaDetailsComponent', () => {
  let component: MapBetaDetailsComponent;
  let fixture: ComponentFixture<MapBetaDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapBetaDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapBetaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
