import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapImageModalComponent } from './map-image-modal.component';

describe('MapImageModalComponent', () => {
  let component: MapImageModalComponent;
  let fixture: ComponentFixture<MapImageModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapImageModalComponent]
    });
    fixture = TestBed.createComponent(MapImageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
