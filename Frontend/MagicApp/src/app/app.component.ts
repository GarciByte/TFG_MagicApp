import { Component, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone";
import { SidebarComponent } from "./components/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, SidebarComponent],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private platform: Platform) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setBackgroundColor({ color: '#3f51b5' });
        StatusBar.setStyle({ style: Style.Dark });
      }
    });
  }

}