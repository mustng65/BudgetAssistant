import { Component, OnInit, signal } from '@angular/core';
import { ActualBudgetService, Category } from '../../services/actual-budget.service';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe, NgClass, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateTime } from 'luxon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-buckets',
  imports: [
    MatCardModule,
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DatePipe,
  ],
  templateUrl: './buckets.html',
  styleUrl: './buckets.scss',
})
export class Buckets implements OnInit {
  bucketGroup = signal<Category[]>([]);
  date!: FormControl<DateTime | null>;

  constructor(private budget: ActualBudgetService) {}

  ngOnInit(): void {
    this.date = new FormControl<DateTime>(DateTime.now());

    this.loadBuckets(this.date.value!);

    this.date.valueChanges.subscribe((value) => {
      console.log('Date Changed: ' + value?.toFormat('MM/dd/yyyy'));
      if (value == null) return;

      this.loadBuckets(value);
    });
  }

  loadBuckets(value: DateTime<boolean>) {
    const year = value.year;
    const month = value.month;

    this.budget.getBudget(year, month).subscribe((res) => {
      const bucketGroupId = res.categoryGroups.filter((group) => (group.name == 'Buckets'))[0].id;
      const savingsGroupId = res.categoryGroups.filter((group) => (group.name == 'Investments and Savings'))[0].id;

      forkJoin([
        this.budget.getCategoryGroupTransactions(year, month, bucketGroupId),
        this.budget.getCategoryGroupTransactions(year, month, savingsGroupId),
      ]).subscribe(([bucketsCategories, savingsCategories]) => {
        const bucketsGroup = res.categoryGroups.filter((group) => group['id'] === bucketGroupId)[0];
        const savingsGroup = res.categoryGroups.filter((group) => group['id'] === savingsGroupId)[0];

        // process all the buckets and load their transactions for the month if they are present
        bucketsGroup.categories.forEach((category) => {
          const groupWithTransactions = bucketsCategories.filter((g) => g['name'] === category.name)[0];

          if (groupWithTransactions) {
            category.transactions = groupWithTransactions.transactions;
          }
        });

        const outOfSavings = savingsGroup.categories.filter((category) => category.name == 'Out of Savings')[0];
        const savings = savingsGroup.categories.filter((category) => category.name == 'Savings')[0];

        // get the budgeted amount for savings for the month
        outOfSavings.budgeted = savings.budgeted;
        // calculate the remain (or overspent) amount for the month
        outOfSavings.balance = savings.budgeted - outOfSavings.spent * -1;

        // add the out of savings bucket to the rest of the buckets
        bucketsGroup.categories.push(outOfSavings);

        // load the out of savings transactions for the month if they are present
        const outOfSavingsTransactions = savingsCategories.filter((category) => category.name == 'Out of Savings')[0];
        if (outOfSavingsTransactions) {
          outOfSavings.transactions = outOfSavingsTransactions.transactions;
        }

        // update the screen
        this.bucketGroup.set(bucketsGroup.categories);
      });
    });
  }

  setMonthAndYear(normalizedMonthAndYear: DateTime, datepicker: MatDatepicker<DateTime>) {
    const ctrlValue = DateTime.fromObject({
      month: normalizedMonthAndYear.month,
      year: normalizedMonthAndYear.year,
    });
    datepicker.close();
    this.date.setValue(ctrlValue);
  }
}
