import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { IonContent, IonButton, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardContent, IonTitle, IonText } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [IonText, IonTitle, IonCardContent, IonCard, IonLabel, IonIcon, IonItem, IonList, IonButton, IonContent,
    CommonModule, TranslateModule],
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
    if ((await this.authService.isAuthenticated()) && this.websocketService.isConnectedRxjs()) {
      this.navCtrl.navigateRoot(['/menu']);
    }
  }

}