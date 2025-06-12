import { Component, OnInit } from '@angular/core';
import { IonFab, IonFabButton, IonFabList, IonIcon, NavController } from "@ionic/angular/standalone";
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [IonIcon, IonFabList, IonFabButton, IonFab, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private modalService: ModalService,
    public translate: TranslateService
  ) { }

  ngOnInit() { }

  async settings(){
    this.navCtrl.navigateRoot(['/settings']);
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await this.authService.logout();
    this.modalService.showToast(
      this.translate.instant('MENU.LOGOUT_SUCCESS'),
      'success'
    );
    this.navCtrl.navigateRoot(['/login']);
  }

}