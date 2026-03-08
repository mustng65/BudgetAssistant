import { formatCurrency } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActualBudgetService } from '../../services/actual-budget.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'yyyy-MM',
  },
  display: {
    dateInput: 'yyyy-MM',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-tithing-calc',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './tithing-calc.html',
  styleUrl: './tithing-calc.scss',
  providers: [provideNativeDateAdapter(MY_FORMATS)],
})
export class TithingCalc implements OnInit {
  remainingPaycheckAmt: string = '0';
  tithing: string = '0';
  savings: string = '0';

  paycheckForm!: FormGroup;

  tithingPercentage = 0.1;
  savingsPercentage = 0.1;
  currencyLocale = 'en-us';
  currencySymbol = '$';

  constructor(
    private fb: FormBuilder,
    private budget: ActualBudgetService,
  ) {}

  ngOnInit(): void {
    this.paycheckForm = this.fb.group({
      paycheckAmt: [0, [Validators.required]],
      retirementDeduction: [305.47, [Validators.required]],
      extraIncome: [0],
      mode: ['manual'],
      budgetDate: [null],
    });

    this.paycheckForm.get('budgetDate')?.valueChanges.subscribe((value) => {
      if (this.paycheckForm.get('mode')?.value == 'manual' || value == null) {
        return;
      }

      const selectBudgetDate = value as Date;
      const year = selectBudgetDate.getFullYear();
      const month = selectBudgetDate.getMonth() + 1;

      if (year < 2000) {
        return;
      }

      this.budget.getBudget(year, month).subscribe({
        next: (res) => {
          const incomeGroup = res.categoryGroups.filter((c) => c['name'] == 'Income')[0];
          const incomeList = incomeGroup['categories'] as Array<{
            name: string;
            received: number;
          }>;
          const incomeAmt = incomeList.filter((c) => c.name == 'Income')[0];
          const extraAmt = incomeList.filter((c) => c.name == 'Extra Income')[0];

          this.paycheckForm.patchValue({
            paycheckAmt: incomeAmt.received / 100,
            extraIncome: extraAmt.received / 100,
          });
        },
        error: (e) => {
          this.paycheckForm.get('budgetDate')?.setErrors({monthLoadError: e.error.error});
        },
      });
    });

    this.paycheckForm.valueChanges.subscribe((values) => {
      let { paycheckAmt, retirementDeduction, extraIncome } = values;

      paycheckAmt = Number(paycheckAmt) || 0;
      retirementDeduction = Number(retirementDeduction) || 0;
      extraIncome = Number(extraIncome) || 0;

      let remainingPaycheckAmt =
        paycheckAmt > retirementDeduction ? paycheckAmt - retirementDeduction : 0;

      this.remainingPaycheckAmt = formatCurrency(
        remainingPaycheckAmt,
        this.currencyLocale,
        this.currencySymbol,
      );

      let paycheckTithing = remainingPaycheckAmt * this.tithingPercentage;
      let extraIncomeTithing = extraIncome * this.tithingPercentage;

      this.tithing = formatCurrency(
        Math.round(paycheckTithing + extraIncomeTithing),
        this.currencyLocale,
        this.currencySymbol,
      );
      this.savings = formatCurrency(
        remainingPaycheckAmt * 0.1 + (extraIncome - extraIncomeTithing),
        this.currencyLocale,
        this.currencySymbol,
      );
    });
  }
}
