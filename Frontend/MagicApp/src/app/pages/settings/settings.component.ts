import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonLabel, IonToggle, IonSelectOption, IonSelect, IonIcon, NavController } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { AppConfig } from 'src/app/models/app-config';
import { ConfigService } from 'src/app/services/config.service';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-settings',
  imports: [IonIcon, IonToggle, IonLabel, IonItem, IonList, IonContent, FormsModule, IonSelectOption, IonSelect, TranslateModule, 
    CommonModule, SidebarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
})
export class SettingsComponent implements OnInit, OnDestroy {
  config: AppConfig;
  error$: Subscription;
  config$: Subscription;

  constructor(
    private configService: ConfigService,
    public navCtrl: NavController,
    private webSocketService: WebsocketService,
    private authService: AuthService) {
    this.config = this.configService.config;
  }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isAuthenticated())) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    this.config$ = this.configService.config$.subscribe(cfg => {
      this.config = cfg;
    });

    this.error$ = this.webSocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }

    if (this.config$) {
      this.config$.unsubscribe();
    }
  }

  toggleTheme(isDark: boolean) {
    const theme = isDark ? 'dark' : 'light';
    this.configService.setTheme(theme);
  }

  changeLanguage(lang: 'es' | 'en') {
    this.configService.setLang(lang);
  }

}