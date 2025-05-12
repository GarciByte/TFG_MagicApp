import { Component, OnDestroy, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone";
import { WebsocketService } from './services/websocket.service';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';

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
    private websocketService: WebsocketService
  ) { }

  async ngOnInit() {
    await this.platform.ready();

    if (this.platform.is('android')) {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#3f51b5' });
      await StatusBar.setStyle({ style: Style.Dark });
    }

    addIcons({
      'chatbubbles-outline': icons.chatbubblesOutline,
      'albums-outline': icons.albumsOutline,
      'flash-outline': icons.flashOutline,
      'notifications-outline': icons.notificationsOutline,
      'chevron-up-circle': icons.chevronUpCircle,
      'document': icons.document,
      'color-palette': icons.colorPalette,
      'globe': icons.globe,
      'add-outline': icons.addOutline,
      'send': icons.send
    });
  }

  ngOnDestroy(): void {
    if (this.websocketService.isConnectedRxjs()) {
      this.websocketService.disconnectRxjs();
    }
  }

}