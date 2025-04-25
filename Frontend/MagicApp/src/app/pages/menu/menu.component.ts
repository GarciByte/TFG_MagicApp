import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonContent, IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-menu',
  imports: [IonTitle, IonContent, IonToolbar, IonHeader, CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
})
export class MenuComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private websocketService: WebsocketService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
  }

}