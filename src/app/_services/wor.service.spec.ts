import { TestBed } from '@angular/core/testing';

import { WorService } from './wor.service';

describe('WorService', () => {
  let service: WorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
