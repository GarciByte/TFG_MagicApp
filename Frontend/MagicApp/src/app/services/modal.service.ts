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

  // Alerta para pedir el motivo de reporte
  async promptReportReason(nickname: string): Promise<string | null> {
    return new Promise(async resolve => {
      const alert = await this.alertCtrl.create({
        header: `Reportar a ${nickname}`,
        message: 'Escribe el motivo de tu reporte',
        cssClass: 'custom-alert',
        inputs: [
          {
            name: 'reason',
            type: 'textarea',
            placeholder: 'Motivo del reporte…'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'Enviar',
            handler: (data: { reason: string }) => {
              const txt = data.reason?.trim() || '';
              resolve(txt || null);
              return true;
            }
          }
        ]
      });

      await alert.present();
    });
  }

}