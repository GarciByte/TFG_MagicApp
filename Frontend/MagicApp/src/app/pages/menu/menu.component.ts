import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { ModalService } from 'src/app/services/modal.service';
import { environment } from '../../../environments/environment';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-menu',
  imports: [CommonModule, IonicModule, SidebarComponent, TranslateModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
})

export class MenuComponent implements OnInit, OnDestroy {
  disconnected$: Subscription;
  error$: Subscription;
  user: User;
  public apiImg = environment.apiImg

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private modalService: ModalService,
    public translate: TranslateService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isAuthenticated())) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    const refreshSuccess = await this.authService.refreshTokens();

    if (!refreshSuccess) {
      await this.authService.logout();

      this.modalService.showAlert(
        'error',
        this.translate.instant('MENU.RENEW_TOKEN'),
        [
          { text: this.translate.instant('COMMON.ACCEPT') }
        ]
      );

      this.navCtrl.navigateRoot(['/']);
    }

    this.user = await this.authService.getUser();

    this.disconnected$ = this.websocketService.disconnected.subscribe(() => {
      console.log("Desconectado del Servidor");
    });

    this.error$ = this.websocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });
  }

  isAdmin(): boolean {
    return this.user?.role === "Admin";
  }

  ngOnDestroy(): void {
    if (this.disconnected$) {
      this.disconnected$.unsubscribe();
    }

    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}