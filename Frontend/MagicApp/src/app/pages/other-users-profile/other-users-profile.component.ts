import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { IonContent, IonButton, IonCard, IonAvatar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-other-users-profile',
  imports: [IonAvatar, IonCard, IonButton, IonContent, CommonModule, FormsModule],
  templateUrl: './other-users-profile.component.html',
  styleUrls: ['./other-users-profile.component.css'],
  standalone: true,
})
export class OtherUsersProfileComponent implements OnInit {

  user: User = null;
  currentUser: User = null;
  avatarUrl: string = "";
  routeQueryMap$: Subscription;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private route: ActivatedRoute,
    private userService: UserService,
    private modalService: ModalService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.currentUser = await this.authService.getUser();
    this.routeQueryMap$ = this.route.queryParamMap.subscribe(queryMap => this.init(queryMap));
  }

  ngOnDestroy(): void {
    if (this.routeQueryMap$) {
      this.routeQueryMap$.unsubscribe();
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
          'Se ha producido un error al obtener los datos del usuario',
          [{ text: 'Aceptar' }]
        );
      }

    } catch (error) {
      console.error("Error al buscar el usuario:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener los datos del usuario',
        [{ text: 'Aceptar' }]
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
    console.log('Ver mazos de', this.user.userId);
  }

  // Reportar al usuario
  reportUser(): void {
    console.log('Reportar usuario', this.user.userId);
  }

}