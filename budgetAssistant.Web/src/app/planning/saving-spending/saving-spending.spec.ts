import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingSpending } from './saving-spending';

describe('SavingSpending', () => {
  let component: SavingSpending;
  let fixture: ComponentFixture<SavingSpending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingSpending],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingSpending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
