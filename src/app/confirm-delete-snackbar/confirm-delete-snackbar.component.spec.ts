import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteSnackbarComponent } from './confirm-delete-snackbar.component';

describe('ConfirmDeleteSnackbarComponent', () => {
  let component: ConfirmDeleteSnackbarComponent;
  let fixture: ComponentFixture<ConfirmDeleteSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteSnackbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
