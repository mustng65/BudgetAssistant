import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TithingCalc } from './tithing-calc';

describe('TithingCalc', () => {
  let component: TithingCalc;
  let fixture: ComponentFixture<TithingCalc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TithingCalc],
    }).compileComponents();

    fixture = TestBed.createComponent(TithingCalc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
