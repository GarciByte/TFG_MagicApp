import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { IonContent, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  imports: [IonButton, IonContent, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
})
export class HomeComponent implements OnInit {

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private websocketService: WebsocketService
  ) { }

  async ngOnInit(): Promise<void> {
    if (await this.authService.isAuthenticated() && this.websocketService.isConnectedRxjs()) {
      this.navCtrl.navigateRoot(['/menu']);
    }
  }

}