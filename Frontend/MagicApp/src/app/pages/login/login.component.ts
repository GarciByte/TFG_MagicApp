import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { ModalService } from 'src/app/services/modal.service';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonButton, IonCardContent, IonCard, IonInput, IonCheckbox } from "@ionic/angular/standalone";
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [IonContent, IonCard, IonCardContent, IonItem, IonInput, IonCheckbox, IonLabel, IonButton, CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
})
export class LoginComponent implements OnInit {
  nickname: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private modalService: ModalService,
    public translate: TranslateService
  ) { }

  async ngOnInit(): Promise<void> {
    if ((await this.authService.isAuthenticated()) && this.websocketService.isConnectedRxjs()) {
      this.navCtrl.navigateRoot(['/menu']);
    }
  }

  async submit() {
    const authData = { nickname: this.nickname, password: this.password };
    const result = await this.authService.login(authData, this.rememberMe);

    if (result.success) {

      this.modalService.showToast(
        this.translate.instant('LOGIN.SUCCESS'),
        'success'
      );

      if (this.websocketService.isConnectedRxjs()) {
        this.navCtrl.navigateRoot(['/menu']);

      } else {
        this.modalService.showAlert(
          'error',
          this.translate.instant('LOGIN.ERROR_SERVER'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );
      }

    } else {
      // Prohibición del usuario
      if (result.statusCode === 403) {

        this.modalService.showAlert(
          'error',
          this.translate.instant('LOGIN.ERROR_SUSPENDED'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      } else {
        console.error(result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('LOGIN.ERROR_CREDENTIALS'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }
    }
  }

}