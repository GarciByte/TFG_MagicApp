import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonToggle, IonSelectOption, IonSelect, IonIcon, NavController } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { AppConfig } from 'src/app/models/app-config';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-settings',
  imports: [IonIcon, IonToggle, IonLabel, IonItem, IonList, IonTitle, IonToolbar, IonHeader, IonContent, FormsModule, IonSelectOption, IonSelect, TranslateModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
})
export class SettingsComponent implements OnInit {
  config: AppConfig;

  constructor(private configService: ConfigService,public navCtrl: NavController,) {
    this.config = this.configService.config;
  }

  ngOnInit(): void {
    this.configService.config$.subscribe(cfg => {
      this.config = cfg;
    });
  }

  toggleTheme(isDark: boolean) {
    const theme = isDark ? 'dark' : 'light';
    this.configService.setTheme(theme);
  }

  changeLanguage(lang: 'es' | 'en') {
    this.configService.setLang(lang);
  }

}
