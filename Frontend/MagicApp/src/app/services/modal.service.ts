import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { checkmarkCircle, closeCircle, warning, informationCircle } from 'ionicons/icons';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController) { }

  // Notificaciones breves
  async showToast(message: string, iconName: string) {

    const iconMap = {
      success: checkmarkCircle,
      error: closeCircle,
      warning: warning,
      info: informationCircle
    };

    const toast = await this.toastCtrl.create({
      message,
      icon: iconMap[iconName],
      duration: 3000,
      position: 'top',
      cssClass: `${iconName}-toast`
    });

    await toast.present();
  }

  // Alertas
  async showAlert(
    iconName: string,
    message: string,
    buttons: { text: string; handler?: () => void }[]
  ) {

    const symbolMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const alert = await this.alertCtrl.create({
      header: symbolMap[iconName],
      message: message,
      cssClass: 'custom-alert',
      buttons: buttons.map(btn => ({
        text: btn.text,
        handler: () => {
          btn.handler?.();
          return true;
        }
      }))
    });

    await alert.present();
  }

}