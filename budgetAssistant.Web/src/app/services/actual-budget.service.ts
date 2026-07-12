import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActualBudgetService {
  constructor(private http: HttpClient) {}

  getBudget(year: number, month: number): Observable<Budget> {
    return this.http.get<Budget>(
      `http://localhost:3000/budgets/${year}/${String(month).padStart(2, '0')}`,
    );
  }

  getCategoryGroups(year: number, month: number): Observable<Category[]> {
    return this.http.get<Category[]>(
      `http://localhost:3000/transactions/Buckets/${year}/${String(month).padStart(2, '0')}`,
    );
  }
}

export interface Budget {
  month: string;
  incomeAvailable: number;
  lastMonthOverspent: number;
  forNextMonth: number;
  totalBudgeted: number;
  toBudget: number;
  fromLastMonth: number;
  totalIncome: number;
  totalSpent: number;
  totalBalance: number;
  categoryGroups: CategoryGroup[]//Record<string, unknown>[];
}

export interface CategoryGroup {
  id: string;
  name: string;
  hidden: boolean;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  hidden: boolean;
  budgeted: number;
  spent: number;
  balance: number;
  received: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  'payee.name': string;
  date: Date;
  amount: number;
  notes: string;
}
