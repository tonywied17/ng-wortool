import { TestBed } from '@angular/core/testing';

import { AuthInjectionServiceService } from './auth-injection-service.service';

describe('AuthInjectionServiceService', () => {
  let service: AuthInjectionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthInjectionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
