import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActualBudgetService {
  private baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getBudget(year: number, month: number): Observable<Budget> {
    return this.http.get<Budget>(
      `${this.baseUrl}/budgets/${year}/${String(month).padStart(2, '0')}`,
    );
  }

  getCategoryGroups(year: number, month: number): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.baseUrl}/transactions/Buckets/${year}/${String(month).padStart(2, '0')}`,
    );
  }

  getAccountByName(name: String): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts?name=${name}&includeCurrentBalance`);
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
  categoryGroups: CategoryGroup[];
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
  addedAmount: number;
}

export interface Transaction {
  id: string;
  'payee.name': string;
  date: Date;
  amount: number;
  notes: string;
}

export interface Account {
  id: string;
  name: string;
  offbudget: boolean;
  closed: boolean;
  balance_current: number;
}
