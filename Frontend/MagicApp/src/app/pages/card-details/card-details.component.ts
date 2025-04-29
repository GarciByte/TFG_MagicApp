import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-details',
  imports: [CommonModule],
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.css'],
  standalone: true,
})
export class CardDetailsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
