import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isNative = Capacitor.isNativePlatform();

  constructor(private storage: Storage) { }

  // Guardar objeto
  async saveObject<T>(key: string, value: T): Promise<void> {
    if (this.isNative) {
      await Preferences.set({
        key: key,
        value: JSON.stringify(value)
      });
    } else {
      await this.storage.set(key, value);
    }
  }

  // Obtener objeto
  async getObject<T>(key: string): Promise<T | null> {
    if (this.isNative) {
      const { value } = await Preferences.get({ key: key });
      return value ? JSON.parse(value) : null;
    } else {
      return await this.storage.get(key) || null;
    }
  }

  // Eliminar objeto
  async removeObject(key: string): Promise<void> {
    if (this.isNative) {
      await Preferences.remove({ key: key });
    } else {
      await this.storage.remove(key);
    }
  }

}