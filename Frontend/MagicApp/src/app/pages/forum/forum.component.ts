import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ForumThread } from 'src/app/models/forum-thread';
import { AuthService } from 'src/app/services/auth.service';
import { ForumService } from 'src/app/services/forum.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { IonButton, IonIcon, IonCard, IonCardHeader, IonContent } from "@ionic/angular/standalone";
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-forum',
  imports: [IonContent, IonCardHeader, IonCard, IonIcon, IonButton, CommonModule, SidebarComponent, TranslateModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
  standalone: true,
})
export class ForumComponent implements OnInit, OnDestroy {
  error$: Subscription;
  threads: ForumThread[] = [];
  displayedThreads: ForumThread[] = [];
  subscribedThreadIds: Set<number> = new Set<number>();
  isAdmin = false;

  // Paginación
  page = 1;
  pageSize = 8;
  totalPages = 1;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private modalService: ModalService,
    private forumService: ForumService,
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

    await this.checkAdmin();
    await this.loadThreads();
  }

  // Comprueba si el usuario actual tiene rol Admin
  async checkAdmin(): Promise<void> {
    try {
      const result = await this.userService.isAdmin();

      if (result.success) {
        this.isAdmin = result.data.isAdmin;

      } else {
        console.error('Error al obtener los datos del usuario:', result.error);
        this.isAdmin = false;
      }

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      this.isAdmin = false;
    }
  }

  // Obtener todos los hilos del foro
  async loadThreads() {
    try {
      const result = await this.forumService.getAllThreads();

      if (result.success) {
        this.threads = result.data;
        await this.loadSubscriptions();
        this.page = 1;
        this.updateThreadsView();

      } else {
        console.error('Error al obtener los hilos del foro:', result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('FORUM.ERROR_FETCH_THREADS'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al obtener los hilos del foro:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('FORUM.ERROR_FETCH_THREADS'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Obtener todos los hilos suscritos por el usuario
  async loadSubscriptions() {
    try {
      const result = await this.forumService.getMySubscriptions();

      if (result.success) {
        const subscribedList = result.data;
        this.subscribedThreadIds.clear();
        subscribedList.forEach(t => this.subscribedThreadIds.add(t.id));

      } else {
        console.error('Error al obtener los hilos suscritos del foro:', result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('FORUM.ERROR_FETCH_SUBSCRIBED'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al obtener los hilos suscritos del foro:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('FORUM.ERROR_FETCH_SUBSCRIBED'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Refresca la lista de hilos
  async refreshList() {
    await this.loadThreads();
  }

  // Actualiza la lista de hilos que se muestran
  updateThreadsView() {
    this.totalPages = Math.ceil(this.threads.length / this.pageSize) || 1;
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    const start = (this.page - 1) * this.pageSize;
    this.displayedThreads = this.threads.slice(start, start + this.pageSize);
  }

  // Cambiar de página
  goPage(delta: number) {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.updateThreadsView();
    }
  }

  // Cambiar a la primera/última página
  goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.updateThreadsView();
    }
  }

  // Comprueba si el usuario está suscrito al hilo
  isSubscribed(threadId: number): boolean {
    return this.subscribedThreadIds.has(threadId);
  }

  // Redirigir a la vista de creación de un hilo
  goToCreateThread() {
    this.navCtrl.navigateRoot(['/create-thread']);
  }

  // Redirigir dentro de un hilo
  openThread(threadId: number) {
    this.navCtrl.navigateRoot(['/thread-detail', threadId]);
  }

  // Suscribirse/Desuscribirse a un hilo
  async toggleSubscribe(threadId: number) {
    const currentlySubscribed = this.isSubscribed(threadId);
    try {

      if (!currentlySubscribed) {
        const result = await this.forumService.subscribe(threadId);

        if (result.success) {
          this.subscribedThreadIds.add(threadId);

          this.modalService.showToast(
            this.translate.instant('FORUM.SUBSCRIBE_SUCCESS'),
            'success'
          );

        } else {
          console.error('Error al suscribirse al hilo:', result.error);

          this.modalService.showAlert(
            'error',
            this.translate.instant('FORUM.ERROR_SUBSCRIBE'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

        }

      } else {
        const result = await this.forumService.unsubscribe(threadId);

        if (result.success) {
          this.subscribedThreadIds.delete(threadId);

          this.modalService.showToast(
            this.translate.instant('FORUM.UNSUBSCRIBE_SUCCESS'),
            'success'
          );

        } else {
          console.error('Error al cancelar la suscripción del hilo:', result.error);

          this.modalService.showAlert(
            'error',
            this.translate.instant('FORUM.ERROR_UNSUBSCRIBE'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

        }
      }

    } catch (error) {
      console.error('Error al cambiar el estado de suscripción del hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('FORUM.ERROR_TOGGLE_SUBSCRIPTION'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Confirmación para cerrar un hilo
  async confirmCloseThread(thread: ForumThread) {
    await this.modalService.showAlert(
      'warning',
      this.translate.instant('FORUM.CONFIRM_CLOSE', { title: thread.title }),
      [
        {
          text: this.translate.instant('COMMON.YES'),
          handler: async () => {
            await this.closeThread(thread.id);
          }
        },
        { text: this.translate.instant('COMMON.NO') }
      ]
    );
  }

  // Cerrar un hilo
  private async closeThread(threadId: number) {
    try {
      const result = await this.forumService.closeThread(threadId);

      if (result.success) {

        this.modalService.showToast(
          this.translate.instant('FORUM.CLOSE_SUCCESS'),
          'success'
        );

        await this.loadThreads();

      } else {
        console.error('Error al cerrar el hilo:', result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('FORUM.ERROR_CLOSE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al cerrar el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('FORUM.ERROR_CLOSE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Confirmación para reabrir un hilo
  async confirmOpenThread(thread: ForumThread) {
    await this.modalService.showAlert(
      'warning',
      this.translate.instant('FORUM.CONFIRM_OPEN', { title: thread.title }),
      [
        {
          text: this.translate.instant('COMMON.YES'),
          handler: async () => {
            await this.openThreadAdmin(thread.id);
          }
        },
        { text: this.translate.instant('COMMON.NO') }
      ]
    );
  }

  // Reabrir un hilo
  private async openThreadAdmin(threadId: number) {
    try {
      const result = await this.forumService.openThread(threadId);

      if (result.success) {

        this.modalService.showToast(
          this.translate.instant('FORUM.OPEN_SUCCESS'),
          'success'
        );

        await this.loadThreads();

      } else {
        console.error('Error al reabrir el hilo:', result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('FORUM.ERROR_OPEN'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al reabrir el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('FORUM.ERROR_OPEN'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Confirmación para borrar un hilo
  async confirmDeleteThread(thread: ForumThread) {
    await this.modalService.showAlert(
      'warning',
      this.translate.instant('FORUM.CONFIRM_DELETE', { title: thread.title }),
      [
        {
          text: this.translate.instant('COMMON.YES'),
          handler: async () => {
            await this.deleteThread(thread.id);
          }
        },
        { text: this.translate.instant('COMMON.NO') }
      ]
    );
  }

  // Borrar un hilo
  private async deleteThread(threadId: number) {
    try {
      const result = await this.forumService.deleteThread(threadId);

      if (result.success) {

        this.modalService.showToast(
          this.translate.instant('FORUM.DELETE_SUCCESS'),
          'success'
        );

        await this.loadThreads();

      } else {
        console.error('Error al borrar el hilo:', result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('FORUM.ERROR_DELETE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al borrar el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('FORUM.ERROR_DELETE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}