import { Component, computed, signal } from '@angular/core';
import {
  ActualBudgetService,
  Account,
  CategoryGroup,
  Category,
} from '../../services/actual-budget.service';
import { CurrencyPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-saving-spending',
  imports: [CurrencyPipe, MatInputModule, FormsModule],
  templateUrl: './saving-spending.html',
  styleUrl: './saving-spending.scss',
})
export class SavingSpending {
  savingsAccount = signal<Account | null>(null);
  newSavingsRemainingBalance = signal<number>(0);
  additionalCategoriesBalance = signal<number>(0);

  startingTotal = signal<number>(0);
  currentTotal = signal<number>(0);
  newTotal = signal<number>(0);

  startingCategoryGroups = signal<CategoryGroup[]>([]);
  currentCategoryGroups = signal<CategoryGroup[]>([]);
  additionalCategories = signal<Category[]>([]);

  savingsRemainingBalance = computed<number>(() => {
    const totalBalance = this.currentCategoryGroups().reduce((total, group) => {
      return (
        total +
        group.categories.reduce((subtotal, category) => {
          return subtotal + category.balance;
        }, 0)
      );
    }, 0);
    console.log(
      `starting total balance: ${totalBalance} | Current Balance: ${this.savingsAccount()?.balance_current}`,
    );
    return (
      (this.savingsAccount()?.balance_current || 0) -
      totalBalance -
      this.additionalCategoriesBalance()
    );
  });

  savingSpendingGroups = [
    'Donations',
    'Travel',
    'Office',
    'Misc',
    'Household - Upgrades',
    'Household - Services',
    'Household - Purchases',
    'Household - Misc',
  ];

  constructor(private budget: ActualBudgetService) {
    budget.getAccountByName('Savings').subscribe((res) => this.savingsAccount.set(res[0]));

    const today = new Date();
    const startDate = new Date(2024, 3, 1);

    forkJoin([
      budget.getBudget(startDate.getFullYear(), startDate.getMonth() + 1),
      budget.getBudget(today.getFullYear(), today.getMonth() + 1),
    ]).subscribe({
      next: ([start, current]) => {
        this.startingCategoryGroups.set(this.getSavingSpendingGroups(start.categoryGroups));
        this.currentCategoryGroups.set(this.getSavingSpendingGroups(current.categoryGroups));

        const additionalCategories: Category[] = [];

        current.categoryGroups.forEach((group) => {
          const found = group.categories.find((category) =>
            ['Minimum Savings Balance', 'New Car'].find((g) => g == category.name),
          );
          if (found) additionalCategories.push(found);
        });
        console.log(additionalCategories);

        this.additionalCategories.set(additionalCategories);
        this.additionalCategoriesBalance.set(
          additionalCategories.reduce((total, item) => total + item.balance, 0),
        );

        this.startingTotal.set(this.calcAllCategoryGroupsTotal(this.startingCategoryGroups()));
        this.currentTotal.set(this.calcAllCategoryGroupsTotal(this.currentCategoryGroups()));

        this.updateNewBalance();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  startingBalance = (groupName: string, categoryName: string) =>
    computed<number>(() => {
      const balance: number =
        this.startingCategoryGroups()
          .find((group) => group.name == groupName)
          ?.categories.find((category) => category.name == categoryName)?.balance || 0;

      return balance;
    });

  updateNewBalance() {
    const totalBalance = this.currentCategoryGroups().reduce((total, group) => {
      return (
        total +
        group.categories.reduce((subtotal, category) => {
          return (
            subtotal + category.balance + (category.addedAmount ? category.addedAmount : 0) * 100
          );
        }, 0)
      );
    }, 0);

    const additionalCategoriesTotalBalance = this.additionalCategories().reduce(
      (total, category) => {
        return (
          total + category.balance + (category.addedAmount ? category.addedAmount : 0) * 100
        );
      },
      0,
    );

    this.newSavingsRemainingBalance.set(
      (this.savingsAccount()?.balance_current || 0) -
        totalBalance -
        additionalCategoriesTotalBalance,
    );
  }

  calcAllCategoryGroupsTotal(categoryGroups: CategoryGroup[]) {
    return categoryGroups.reduce((total, group) => {
      return (
        total + group.categories.reduce((subtotal, category) => subtotal + category.balance, 0)
      );
    }, 0);
  }

  getSavingSpendingGroups(allGroup: CategoryGroup[]) {
    return allGroup.filter(
      (group) => this.savingSpendingGroups.find((g) => g == group.name) != null,
    );
  }
}
