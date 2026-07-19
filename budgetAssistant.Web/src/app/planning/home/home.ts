import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SavingSpending } from "../saving-spending/saving-spending";

@Component({
  selector: 'app-home',
  imports: [MatTabsModule, SavingSpending],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
