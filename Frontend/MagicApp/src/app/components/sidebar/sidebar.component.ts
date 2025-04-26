import { Component, OnInit } from '@angular/core';
import { IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [IonTitle],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}