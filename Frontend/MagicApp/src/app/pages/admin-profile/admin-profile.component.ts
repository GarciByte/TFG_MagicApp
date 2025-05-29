import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Report, ReportStatus } from 'src/app/models/report';
import { MsgType, WebSocketMessage } from 'src/app/models/web-socket-message';
import {
  IonContent, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonSearchbar,
  IonSelect, IonSelectOption, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-profile',
  imports: [IonIcon, CommonModule, FormsModule, IonContent, IonButton, IonCard, IonCardHeader, IonCardSubtitle,
    IonCardContent, IonSearchbar, IonSelect, IonSelectOption],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
  standalone: true,
})
export class AdminProfileComponent implements OnInit {

  isAdmin = false;
  user: User = null;
  allUsers: User[] = [];
  allReports: Report[] = [];
  ReportStatus = ReportStatus;

  // Paginación y búsqueda
  reportPage = 1;
  reportPageSize: number = 5;
  reportSearchTerm = '';

  userPage = 1;
  userPageSize: number = 5;
  userSearchTerm = '';

  filteredReports: Report[] = [];
  displayedReports: Report[] = [];
  reportTotalPages = 0;

  filteredUsers: User[] = [];
  displayedUsers: User[] = [];
  userTotalPages = 0;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private reportService: ReportService,
    private modalService: ModalService,
    private webSocketService: WebsocketService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
    await this.loadUser();
  }

  async loadUser(): Promise<void> {

    try {
      const result = await this.userService.isAdmin();

      if (result.success) {
        this.isAdmin = result.data.isAdmin;

      } else {
        console.error("Error al obtener los datos del usuario:", result.error);
      }

    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }

    if (this.isAdmin) {
      this.user = await this.authService.getUser();
      await this.getAllUsers();
      await this.getAllReports();

    } else {
      this.navCtrl.navigateRoot(['/']);
    }
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<void> {
    try {
      const result = await this.userService.getAllUsers();

      if (result.success) {
        this.allUsers = result.data;
        this.updateUsersView();

      } else {
        console.error("Error al obtener todos los usuarios:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al obtener todos los usuarios',
          [{ text: 'Aceptar' }]
        );
      }

    } catch (error) {
      console.error("Error al obtener todos los usuarios:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener todos los usuarios',
        [{ text: 'Aceptar' }]
      );
    }
  }

  // Obtener todos los reportes
  async getAllReports(): Promise<void> {
    try {
      const result = await this.reportService.getAllReports();

      if (result.success) {
        this.allReports = result.data;
        this.updateReportsView();

      } else {
        console.error("Error al obtener todos los reportes:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al obtener todos los reportes',
          [{ text: 'Aceptar' }]
        );
      }

    } catch (error) {
      console.error("Error al obtener todos los reportes:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener todos los reportes',
        [{ text: 'Aceptar' }]
      );
    }
  }

  // Actualizar el estado de un reporte
  async updateReportStatus(report: Report) {
    try {
      const status = report.status;

      if (status === ReportStatus.InReview) {
        report.status = ReportStatus.Completed;

      } else {
        report.status = ReportStatus.InReview;
      }

      const result = await this.reportService.updateReportStatus(report.id, report.status);

      if (!result.success) {
        console.error("Error al modificar el reporte:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al modificar el reporte del usuario',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al modificar el reporte:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al modificar el reporte del usuario',
        [{ text: 'Aceptar' }]
      );
    }

    await this.getAllReports();
    await this.getAllUsers();
  }

  // Editar el rol de un usuario
  async modifyUserRole(user: User) {
    try {
      let role = user.role;

      if (role === "Admin") {
        role = "User";
      } else {
        role = "Admin";
      }

      const result = await this.userService.modifyRole(user.userId, role);

      if (!result.success) {
        console.error("Error al modificar el rol:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al modificar el rol del usuario',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al modificar el rol:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al modificar el rol del usuario',
        [{ text: 'Aceptar' }]
      );
    }

    await this.getAllUsers();
  }

  // Alerta para editar la prohibición de un usuario
  async confirmModifyUserBan(user: User) {

    await this.modalService.showAlert(
      'warning',
      `¿Estás seguro de que quieres modificar la prohibición de ${user.nickname}?`,
      [
        {
          text: 'Sí',
          handler: async () => {
            await this.modifyUserBan(user);
          }
        },
        { text: 'No' }
      ]
    );
  }

  // Editar la prohibición de un usuario
  async modifyUserBan(user: User) {
    try {
      let isBanned = user.isBanned;

      if (isBanned) {
        isBanned = false;
      } else {
        isBanned = true;
      }

      const result = await this.userService.modifyBan(user.userId, isBanned);

      if (result.success) {
        this.modalService.showToast(`Se ha modificado la prohibición de ${user.nickname}`, "success");

        if (isBanned) {

          const message: WebSocketMessage = {
            Type: MsgType.UserBanned,
            Content: user.userId,
          };

          this.webSocketService.sendRxjs(message);
        }

      } else {
        console.error("Error al modificar la prohibición:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al modificar la prohibición del usuario',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al modificar la prohibición:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al modificar la prohibición del usuario',
        [{ text: 'Aceptar' }]
      );
    }

    await this.getAllUsers();
  }

  // Alerta para eliminar un reporte
  async confirmDeleteReport(report: Report) {
    await this.modalService.showAlert(
      'warning',
      `¿Estás seguro de que quieres eliminar el reporte #${report.id}?`,
      [
        {
          text: 'Sí',
          handler: async () => {
            await this.deleteReport(report.id);
          }
        },
        { text: 'No' }
      ]
    );
  }

  // Eliminar un reporte
  private async deleteReport(id: number) {
    try {
      const result = await this.reportService.deleteReport(id);

      if (result.success) {
        this.modalService.showToast(`Reporte #${id} eliminado.`, 'success');

      } else {
        console.error("Error al eliminar el reporte:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al eliminar el reporte',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al eliminar el reporte:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al eliminar el reporte',
        [{ text: 'Aceptar' }]
      );
    }

    await this.getAllReports();
  }

  // Filtrado y paginado para Reports
  updateReportsView() {
    this.filteredReports = this.allReports.filter(r =>
      r.reporterNickname.toLowerCase().includes(this.reportSearchTerm.toLowerCase()) ||
      r.reportedUserNickname.toLowerCase().includes(this.reportSearchTerm.toLowerCase())
    );

    const pageSize = Number(this.reportPageSize);
    this.reportTotalPages = Math.ceil(this.filteredReports.length / pageSize) || 1;

    if (this.reportPage > this.reportTotalPages) {
      this.reportPage = 1;
    }

    const start = (this.reportPage - 1) * pageSize;
    this.displayedReports = this.filteredReports.slice(start, start + pageSize);
  }

  // Filtrado y paginado para Users
  updateUsersView() {
    this.filteredUsers = this.allUsers.filter(u =>
      u.nickname.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );

    const pageSize = Number(this.userPageSize);
    this.userTotalPages = Math.ceil(this.filteredUsers.length / pageSize) || 1;

    if (this.userPage > this.userTotalPages) {
      this.userPage = 1;
    }

    const start = (this.userPage - 1) * pageSize;
    this.displayedUsers = this.filteredUsers.slice(start, start + pageSize);
  }

  // Paginación y búsqueda
  onReportSearchChange() {
    this.reportPage = 1;
    this.updateReportsView();
  }

  onReportPageSizeChange() {
    this.reportPage = 1;
    this.updateReportsView();
  }

  goReportPage(delta: number) {
    const newPage = this.reportPage + delta;
    if (newPage >= 1 && newPage <= this.reportTotalPages) {
      this.reportPage = newPage;
      this.updateReportsView();
    }
  }

  onUserSearchChange() {
    this.userPage = 1;
    this.updateUsersView();
  }

  onUserPageSizeChange() {
    this.userPage = 1;
    this.updateUsersView();
  }

  goUserPage(delta: number) {
    const newPage = this.userPage + delta;
    if (newPage >= 1 && newPage <= this.userTotalPages) {
      this.userPage = newPage;
      this.updateUsersView();
    }
  }

}