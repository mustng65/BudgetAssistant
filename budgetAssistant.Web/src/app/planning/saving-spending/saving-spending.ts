import { Component, computed, signal } from '@angular/core';
import { ActualBudgetService, Account, CategoryGroup } from '../../services/actual-budget.service';
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

  startingCategoryGroups = signal<CategoryGroup[]>([]);
  currentCategoryGroups = signal<CategoryGroup[]>([]);

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
    return (this.savingsAccount()?.balance_current || 0) - totalBalance;
  });

  savingSpendingGroups = [
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
        const startSavingsCategories = start.categoryGroups.filter(
          (group) => this.savingSpendingGroups.find((g) => g == group.name) != null,
        );

        const currentSavingsCategories = current.categoryGroups.filter(
          (group) => this.savingSpendingGroups.find((g) => g == group.name) != null,
        );

        this.startingCategoryGroups.set(startSavingsCategories);
        this.currentCategoryGroups.set(currentSavingsCategories);
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

    this.newSavingsRemainingBalance.set(
      (this.savingsAccount()?.balance_current || 0) - totalBalance,
    );
  }
}
