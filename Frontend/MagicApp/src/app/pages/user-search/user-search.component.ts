import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { IonContent, IonButton, IonSearchbar, IonCard, IonAvatar, IonCardTitle, IonIcon } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-user-search',
  imports: [IonIcon, IonCardTitle, IonAvatar, IonCard, IonSearchbar, IonButton, IonContent, CommonModule, 
    FormsModule, SidebarComponent, TranslateModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
  standalone: true,
})
export class UserSearchComponent implements OnInit, OnDestroy {
  error$: Subscription;
  searchTerm = '';
  filteredUsers: User[] = [];
  hasSearched = false;
  isLoading = false;
  user: User;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private modalService: ModalService,
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

    this.user = await this.authService.getUser();
  }

  // Buscar usuarios por nombre
  async search() {
    const term = this.searchTerm.trim();
    this.hasSearched = true;
    this.isLoading = true;

    if (!term) {
      this.filteredUsers = [];
      this.isLoading = false;
      return;
    }

    try {
      const result = await this.userService.searchUsers(term);

      if (result.success && result.data) {
        this.filterUsers(result.data);

      } else {
        console.error("Error obteniendo los usuarios:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('USER_SEARCH.ERROR_LOADING_USERS'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

        this.filteredUsers = [];
      }

    } catch (error) {
      console.error("Error obteniendo los usuarios:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('USER_SEARCH.ERROR_LOADING_USERS'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

      this.filteredUsers = [];

    } finally {
      this.isLoading = false;
    }
  }

  // Filtra la lista de usuarios y obtiene los avatares
  async filterUsers(users: User[]): Promise<void> {
    users = users.filter(user => user.userId !== this.user.userId);
    const apiImg = environment.apiImg;

    for (const user of users) {
      user.avatarUrl = apiImg + user.avatarUrl;
    }

    this.filteredUsers = users;
  }

  // Redirigir al perfil del usuario
  navigateToProfile(userId: number): void {
    this.navCtrl.navigateRoot(
      ['/other-users-profile'],
      { queryParams: { id: userId } }
    );
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}