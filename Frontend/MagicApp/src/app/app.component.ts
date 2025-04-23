import { Component, OnDestroy, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone";
import { WebsocketService } from './services/websocket.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private websocketService: WebsocketService
  ) { }

  async ngOnInit() {
    await this.platform.ready();

    if (this.platform.is('android')) {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#3f51b5' });
      await StatusBar.setStyle({ style: Style.Dark });
    }

    if (await this.authService.isAuthenticated() && this.websocketService.isConnectedRxjs()) {
      const user = await this.authService.getUser();
      console.log("Usuario logeado:", user);

    } else {
      console.log("Usuario no logeado");
    }
  }

  ngOnDestroy(): void {
    if (this.websocketService.isConnectedRxjs()) {
      this.websocketService.disconnectRxjs();
    }
  }

}