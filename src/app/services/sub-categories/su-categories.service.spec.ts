import { TestBed } from '@angular/core/testing';

import { SuCategoriesService } from './su-categories.service';

describe('SuCategoriesService', () => {
  let service: SuCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
