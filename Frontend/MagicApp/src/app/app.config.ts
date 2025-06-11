import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { IMAGE_CONFIG } from '@angular/common';
import { IonicRouteStrategy } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { AuthService } from './services/auth.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ConfigService } from './services/config.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(),
    provideAnimationsAsync(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        defaultLanguage: 'es'
      })
    ),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true
      }
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    provideIonicAngular({
      mode: 'md',
      hardwareBackButton: true,
      rippleEffect: true
    }),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__mydb',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
      })
    ),
    provideAppInitializer(() => {
      const storage = inject(Storage);
      return storage.create();
    }),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.autoLogin();
    }),
    provideAppInitializer(() => {
      const cfg = inject(ConfigService);
      return cfg.init();
    })
  ]
};