import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { IonContent, IonButton, IonCard, IonAvatar, IonIcon } from "@ionic/angular/standalone";
import { ReportService } from 'src/app/services/report.service';
import { NewReport } from 'src/app/models/new-report';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-other-users-profile',
  imports: [IonIcon, IonAvatar, IonCard, IonButton, IonContent, CommonModule, FormsModule, SidebarComponent, TranslateModule],
  templateUrl: './other-users-profile.component.html',
  styleUrls: ['./other-users-profile.component.css'],
  standalone: true,
})
export class OtherUsersProfileComponent implements OnInit, OnDestroy {
  error$: Subscription;
  user: User = null;
  currentUser: User = null;
  avatarUrl: string = "";
  routeQueryMap$: Subscription;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private route: ActivatedRoute,
    private userService: UserService,
    private modalService: ModalService,
    private reportService: ReportService,
    private webSocketService: WebsocketService,
    public translate: TranslateService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isAuthenticated())) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    this.error$ = this.webSocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });

    this.currentUser = await this.authService.getUser();
    this.routeQueryMap$ = this.route.queryParamMap.subscribe(queryMap => this.init(queryMap));
  }

  ngOnDestroy(): void {
    if (this.routeQueryMap$) {
      this.routeQueryMap$.unsubscribe();
    }

    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

  // Obtener datos del perfil
  async init(queryMap: ParamMap) {
    const userId = parseInt(queryMap.get("id"));

    if (!userId) {
      this.navCtrl.navigateRoot(['/menu']);
    }

    if (this.currentUser.userId === userId) {
      this.navCtrl.navigateRoot(['/menu']);
    }

    await this.getUser(userId);
  }

  // Obtener datos del usuario
  async getUser(userId: number): Promise<void> {
    try {
      const result = await this.userService.getUserById(userId);
      const apiImg = environment.apiImg;

      if (result.success) {
        this.user = result.data;
        this.avatarUrl = apiImg + this.user.avatarUrl;

      } else {
        console.error("Error al buscar el usuario:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('OTHER_USERS_PROFILE.ERROR_GET_USER_DATA'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error al buscar el usuario:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('OTHER_USERS_PROFILE.ERROR_GET_USER_DATA'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Enviar un mensaje privado al usuario
  sendMessage(): void {
    this.navCtrl.navigateRoot(
      ['/private-chat'],
      { queryParams: { id: this.user.userId } }
    );
  }

  // Ver mazos del usuario
  viewDecks(): void {
    this.navCtrl.navigateRoot(
      ['/other-user-deck'],
      { queryParams: { id: this.user.userId } }
    );
  }

  // Reportar al usuario
  async reportUser(): Promise<void> {
    const reason = await this.modalService.promptReportReason(this.user.nickname);

    if (!reason) {

      this.modalService.showToast(
        this.translate.instant('OTHER_USERS_PROFILE.REPORT_CANCELLED'),
        'warning'
      );

      return;
    }

    const newReport: NewReport = {
      ReportedUserId: this.user.userId,
      Reason: reason
    };

    try {
      const result = await this.reportService.createReport(newReport);

      if (result.success) {

        this.modalService.showToast(
          this.translate.instant('OTHER_USERS_PROFILE.REPORT_SUCCESS', { nickname: this.user.nickname }),
          'success'
        );

      } else {

        if (result.error === 'Conflict') {

          this.modalService.showAlert(
            'warning',
            this.translate.instant('OTHER_USERS_PROFILE.ALREADY_REPORTED'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

        } else {
          console.error("Se ha producido un error al enviar el reporte:", result.error);

          this.modalService.showAlert(
            'error',
            this.translate.instant('OTHER_USERS_PROFILE.ERROR_SEND_REPORT'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

        }
      }

    } catch (error) {
      console.error("Se ha producido un error al enviar el reporte:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('OTHER_USERS_PROFILE.ERROR_SEND_REPORT'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

}