import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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
  categoryGroups: Record<string, unknown>[];
}
