import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonContent, IonTitle, IonButton } from "@ionic/angular/standalone";
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-menu',
  imports: [IonButton, IonTitle, IonContent, IonToolbar, IonHeader, CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
})
export class MenuComponent implements OnInit, OnDestroy {

  // Suscripciones a los datos necesarios
  disconnected$: Subscription;
  error$: Subscription;

  user: User;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private modalService: ModalService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    const refreshSuccess = await this.authService.refreshTokens();

    if (!refreshSuccess) {
      await this.authService.logout();

      this.modalService.showAlert(
        'error',
        'No se ha podido renovar el token del usuario',
        [{ text: 'Aceptar' }]
      );

      this.navCtrl.navigateRoot(['/']);
    }

    this.user = await this.authService.getUser();

    this.disconnected$ = this.websocketService.disconnected.subscribe(() => {
      console.warn("Desconectado del Servidor");
    });

    this.error$ = this.websocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });
  }

  ngOnDestroy(): void {
    if (this.disconnected$) {
      this.disconnected$.unsubscribe();
    }

    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await this.authService.logout();
    this.modalService.showToast("Has cerrado sesión con éxito", "success");
    this.navCtrl.navigateRoot(['/login']);
  }

}