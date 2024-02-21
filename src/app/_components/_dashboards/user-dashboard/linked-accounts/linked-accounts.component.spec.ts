import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedAccountsComponent } from './linked-accounts.component';

describe('LinkedAccountsComponent', () => {
  let component: LinkedAccountsComponent;
  let fixture: ComponentFixture<LinkedAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedAccountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
