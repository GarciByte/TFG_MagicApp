import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { AppConfig } from '../models/app-config';

const CONFIG_KEY = 'app_config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private defaultConfig: AppConfig = {
    lang: 'es',
    theme: 'light'
  };

  // Suscripción para obtener la configuración actual
  private configSubject = new BehaviorSubject<AppConfig>(this.defaultConfig);
  public config$: Observable<AppConfig> = this.configSubject.asObservable();

  constructor(
    private storage: StorageService,
    private translate: TranslateService
  ) { }

  // Inicializar
  async init(): Promise<void> {
    const saved = await this.storage.getObject<AppConfig>(CONFIG_KEY);
    const cfg = saved ?? await this.detectNativeConfig();
    await this.updateConfig(cfg);
  }

  // Cambiar el idioma
  setLang(lang: AppConfig['lang']): void {
    this.updateConfig({ ...this.config, lang });
  }

  // Cambiar el tema
  setTheme(theme: AppConfig['theme']): void {
    this.updateConfig({ ...this.config, theme });
  }

  // Obtener configuración actual
  get config(): AppConfig {
    return this.configSubject.getValue();
  }

  // Detectar los valores nativos
  private async detectNativeConfig(): Promise<AppConfig> {
    const lang = await this.detectLang();
    const theme = this.detectTheme();
    return { ...this.defaultConfig, lang, theme };
  }

  // Detecta idioma
  private async detectLang(): Promise<'es' | 'en'> {
    try {
      let code = Capacitor.isNativePlatform() ? (await Device.getLanguageCode()).value : navigator.language;
      const short = code.split('-')[0].toLowerCase();
      return (short === 'en') ? 'en' : 'es';
    } catch {
      return this.defaultConfig.lang;
    }
  }

  // Detecta tema
  private detectTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Persiste y reaplica la config
  private async updateConfig(cfg: AppConfig) {
    this.configSubject.next(cfg);
    this.applyConfig(cfg);
    await this.storage.saveObject(CONFIG_KEY, cfg);
  }

  // Aplica la config
  private applyConfig(cfg: AppConfig) {
    this.translate.use(cfg.lang);
    const root = document.documentElement;
    root.classList.toggle('dark', cfg.theme === 'dark');
  }

}