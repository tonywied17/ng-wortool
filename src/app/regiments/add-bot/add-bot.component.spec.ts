import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBotComponent } from './add-bot.component';

describe('AddBotComponent', () => {
  let component: AddBotComponent;
  let fixture: ComponentFixture<AddBotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddBotComponent]
    });
    fixture = TestBed.createComponent(AddBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
