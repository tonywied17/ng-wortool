import { TestBed } from '@angular/core/testing';

import { MusterUserService } from './muster-user.service';

describe('MusterUserService', () => {
  let service: MusterUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusterUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
