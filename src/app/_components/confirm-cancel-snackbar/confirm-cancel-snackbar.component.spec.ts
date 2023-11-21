import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCancelSnackbarComponent } from './confirm-cancel-snackbar.component';

describe('ConfirmCancelSnackbarComponent', () => {
  let component: ConfirmCancelSnackbarComponent;
  let fixture: ComponentFixture<ConfirmCancelSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmCancelSnackbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCancelSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
