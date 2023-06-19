import { TestBed } from '@angular/core/testing';

import { RegimentService } from './regiment.service';

describe('RegimentService', () => {
  let service: RegimentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegimentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
