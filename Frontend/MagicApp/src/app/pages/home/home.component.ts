import { Component, OnInit } from '@angular/core';
import {IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  imports: [IonTitle],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
})
export class HomeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
