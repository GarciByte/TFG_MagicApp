import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { checkmarkCircle, closeCircle, warning, informationCircle } from 'ionicons/icons';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) { }

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
      const header = this.translate.instant('REPORT.ALERT_TITLE', { nickname });
      const message = this.translate.instant('REPORT.MESSAGE');
      const placeholder = this.translate.instant('REPORT.PLACEHOLDER');
      const cancelText = this.translate.instant('REPORT.CANCEL');
      const sendText = this.translate.instant('REPORT.SEND');

      const alert = await this.alertCtrl.create({
        header,
        message,
        cssClass: 'custom-alert',
        inputs: [
          {
            name: 'reason',
            type: 'textarea',
            placeholder
          }
        ],
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: sendText,
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