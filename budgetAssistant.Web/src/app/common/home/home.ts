import { Component } from '@angular/core';
import { ActualBudgetService, CategoryGroup } from '../../services/actual-budget.service';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    CurrencyPipe,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  bucketGroup?: CategoryGroup;

  constructor(private budget: ActualBudgetService) {

    budget.getBudget(2026, 6).subscribe((res) => {
      const group = res.categoryGroups.filter((group) => group['name'] === 'Buckets')[0];
      
      budget.getCategoryGroups(2026, 6).subscribe((categories) => {

        group.categories.forEach((category) => {
          const group = categories.filter((g) => g['name'] === category.name)[0];
          if (group) {
            category.transactions = group.transactions;
          }
        });

        this.bucketGroup = group;
      });

    

    });

  }
}
