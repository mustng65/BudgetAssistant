import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [MatButtonModule, RouterLink, MatListModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  main = [{ title: 'Home', link: 'home', icon:'house' }];
  utilities = [{ title: 'Tithing Calculator', link: 'tithingCalc', icon:'calculate' }];
  activeLink: string | null = null;
}
