import { Component, OnInit } from '@angular/core';
import { ActualBudgetService, CategoryGroup } from '../../services/actual-budget.service';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateTime } from 'luxon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

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
  ],
  templateUrl: './buckets.html',
  styleUrl: './buckets.scss',
})
export class Buckets implements OnInit {
  bucketGroup?: CategoryGroup;
  date!: FormControl<DateTime | null>;

  constructor(private budget: ActualBudgetService) {}
  ngOnInit(): void {
    this.date = new FormControl<DateTime>(DateTime.now().minus({ month: 1 }));

    this.loadBuckets(this.date.value!);

    // this.date.valueChanges.subscribe((value) => {
    //   console.log('Date Changed: ' + value?.toFormat('MM/dd/yyyy'));
    //   if (value == null) return;

    //   this.loadBuckets(value);
    // });
  }

  loadBuckets(value: DateTime<boolean>) {
    const year = value.year;
    const month = value.month;

    this.budget.getBudget(year, month).subscribe((res) => {
      const group = res.categoryGroups.filter((group) => group['name'] === 'Buckets')[0];

      console.log('Got group');

      this.budget.getCategoryGroups(year, month).subscribe((categories) => {
        console.log('Got group - transactions');

        group.categories.forEach((category) => {
          const groupWithTransactions = categories.filter((g) => g['name'] === category.name)[0];

          if (groupWithTransactions) {
            console.log('found matching group: ' + category.name);
            category.transactions = groupWithTransactions.transactions;
          }
        });
        console.log('Set bucket group - start');
        this.bucketGroup = group;
        console.log('Set bucket group - end');
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
