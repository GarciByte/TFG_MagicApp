import { Component, OnDestroy, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone";
import { WebsocketService } from './services/websocket.service';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';

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
  ) {
    addIcons({
      'chatbubbles-outline': icons.chatbubblesOutline,
      'albums-outline': icons.albumsOutline,
      'flash-outline': icons.flashOutline,
      'notifications-outline': icons.notificationsOutline,
      'notifications': icons.notifications,
      'chevron-up-circle': icons.chevronUpCircle,
      'document': icons.document,
      'color-palette': icons.colorPalette,
      'globe': icons.globe,
      'add-outline': icons.addOutline,
      'send': icons.send,
      'trash-outline': icons.trashOutline,
      'chevron-back': icons.chevronBack,
      'chevron-forward': icons.chevronForward,
      'layers-outline': icons.layersOutline,
      'refresh-outline': icons.refreshOutline,
      'lock-closed-outline': icons.lockClosedOutline,
      'lock-open-outline': icons.lockOpenOutline,
      'log-in-outline': icons.logInOutline,
      'arrowBackOutline': icons.arrowBackOutline,
      'sparkles': icons.sparkles,
      'filterOutline': icons.filterOutline,
      'addCircleOutline': icons.addCircleOutline
    });
  }

  async ngOnInit() {
    await this.platform.ready();

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#3f51b5' });
      await StatusBar.setStyle({ style: Style.Dark });
    }

    console.log('Platform:', Capacitor.getPlatform());
    console.log('ENVIRONMENT:', environment);
  }

  ngOnDestroy(): void {
    if (this.websocketService.isConnectedRxjs()) {
      this.websocketService.disconnectRxjs();
    }
  }

}