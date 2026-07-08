import { Component } from '@angular/core';
import { Buckets } from '../../budget/buckets/buckets';

@Component({
  selector: 'app-home',
  imports: [ Buckets],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
