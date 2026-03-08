import { TestBed } from '@angular/core/testing';

import { ActualBudgetService } from './actual-budget.service';

describe('ActualBudgetService', () => {
  let service: ActualBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActualBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
