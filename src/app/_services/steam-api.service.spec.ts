import { TestBed } from '@angular/core/testing';

import { SteamApiService } from './steam-api.service';

describe('SteamApiService', () => {
  let service: SteamApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
