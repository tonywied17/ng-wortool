import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteMapsComponent } from './favorite-maps.component';

describe('FavoriteMapsComponent', () => {
  let component: FavoriteMapsComponent;
  let fixture: ComponentFixture<FavoriteMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteMapsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FavoriteMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
