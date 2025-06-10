import { Component, OnInit } from '@angular/core';
import { IonFab, IonFabButton, IonFabList, IonIcon, NavController } from "@ionic/angular/standalone";
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [IonIcon, IonFabList, IonFabButton, IonFab],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private modalService: ModalService
  ) { }

  ngOnInit() { }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.modalService.showToast("Has cerrado sesión con éxito", "success");
    this.navCtrl.navigateRoot(['/login']);
  }

}