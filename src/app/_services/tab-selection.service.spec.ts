import { TestBed } from '@angular/core/testing';

import { TabSelectionService } from './tab-selection.service';

describe('TabSelectionService', () => {
  let service: TabSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
