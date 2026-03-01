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

@Component({
  selector: 'app-tithing-calc',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatDividerModule],
  templateUrl: './tithing-calc.html',
  styleUrl: './tithing-calc.scss',
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.paycheckForm = this.fb.group({
      paycheckAmt: [0, [Validators.required]],
      retirementDeduction: [305.47, [Validators.required]],
      extraIncome: [0],
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
