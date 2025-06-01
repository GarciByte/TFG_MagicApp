import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ForumThread } from 'src/app/models/forum-thread';
import { AuthService } from 'src/app/services/auth.service';
import { ForumService } from 'src/app/services/forum.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forum',
  imports: [CommonModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
  standalone: true,
})
export class ForumComponent implements OnInit {

  threads: ForumThread[] = [];
  subscribedThreadIds: Set<number> = new Set<number>();
  isLoading = false;
  isAdmin = false;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private modalService: ModalService,
    private forumService: ForumService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
    await this.checkAdmin();
    await this.loadThreads();

    console.log(this.threads);
    console.log(this.subscribedThreadIds);
    console.log(this.isAdmin);
  }

  // Comprueba si el usuario actual tiene rol Admin
  async checkAdmin(): Promise<void> {
    try {
      const result = await this.userService.isAdmin();

      if (result.success) {
        this.isAdmin = result.data.isAdmin;

      } else {
        console.error("Error al obtener los datos del usuario:", result.error);
        this.isAdmin = false;
      }

    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.isAdmin = false;
    }
  }

  // Obtener todos los hilos del foro
  async loadThreads() {
    this.isLoading = true;

    try {
      const result = await this.forumService.getAllThreads();

      if (result.success) {
        this.threads = result.data;
        await this.loadSubscriptions();

      } else {
        console.error("Error al obtener los hilos del foro:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al obtener todos los hilos del foro',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al obtener los hilos del foro:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener todos los hilos del foro',
        [{ text: 'Aceptar' }]
      );

    } finally {
      this.isLoading = false;
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
        console.error("Error al obtener los hilos suscritos del foro:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al obtener todos los hilos suscritos del foro',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al obtener los hilos suscritos del foro:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener todos los hilos suscritos del foro',
        [{ text: 'Aceptar' }]
      );

    }
  }

  // Actualizar la lista de hilos
  async refreshList() {
    await this.loadThreads();
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
    this.navCtrl.navigateRoot(
      ['/thread-detail'],
      { queryParams: { id: threadId } }
    );
  }

  // Suscribirse/Desuscribirse a un hilo
  async toggleSubscribe(threadId: number) {
    const currentlySubscribed = this.isSubscribed(threadId);

    try {

      if (!currentlySubscribed) {
        const result = await this.forumService.subscribe(threadId);

        if (result.success) {
          this.subscribedThreadIds.add(threadId);
          this.modalService.showToast('Te has suscrito al hilo', "success");

        } else {
          console.error("Error al suscribirse al hilo:", result.error);

          this.modalService.showAlert(
            'error',
            'Se ha producido un error al suscribirse al hilo',
            [{ text: 'Aceptar' }]
          );

        }

      } else {
        const result = await this.forumService.unsubscribe(threadId);

        if (result.success) {
          this.subscribedThreadIds.delete(threadId);
          this.modalService.showToast('Has cancelado la suscripción del hilo', "success");

        } else {
          console.error("Error al cancelar la suscripción del hilo:", result.error);

          this.modalService.showAlert(
            'error',
            'Se ha producido un error al cancelar la suscripción del hilo',
            [{ text: 'Aceptar' }]
          );

        }
      }

    } catch (error) {
      console.error('Error al cambiar el estado de suscripción del hilo:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al cambiar el estado de suscripción del hilo',
        [{ text: 'Aceptar' }]
      );

    }
  }

  // Confirmación para cerrar un hilo
  async confirmCloseThread(thread: ForumThread) {
    await this.modalService.showAlert(
      'warning',
      `¿Estás seguro de que quieres cerrar el hilo “${thread.title}”?`,
      [
        {
          text: 'Sí',
          handler: async () => {
            await this.closeThread(thread.id);
          }
        },
        { text: 'No' }
      ]
    );
  }

  // Cerrar un hilo
  private async closeThread(threadId: number) {
    try {
      const result = await this.forumService.closeThread(threadId);

      if (result.success) {
        this.modalService.showToast('Has cerrado el hilo', "success");
        await this.loadThreads();

      } else {
        console.error("Error al cerrar el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al cerrar el hilo',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error('Error al cerrar el hilo:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al cerrar el hilo',
        [{ text: 'Aceptar' }]
      );

    }
  }

  // Confirmación para reabrir un hilo
  async confirmOpenThread(thread: ForumThread) {
    await this.modalService.showAlert(
      'warning',
      `¿Estás seguro de que quieres reabrir el hilo “${thread.title}”?`,
      [
        {
          text: 'Sí',
          handler: async () => {
            await this.openThreadAdmin(thread.id);
          }
        },
        { text: 'No' }
      ]
    );
  }

  // Reabrir un hilo
  private async openThreadAdmin(threadId: number) {
    try {
      const result = await this.forumService.openThread(threadId);

      if (result.success) {
        this.modalService.showToast('Has reabierto el hilo', "success");
        await this.loadThreads();

      } else {
        console.error("Error al reabrir el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al reabrir el hilo',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error('Error al reabrir el hilo:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al reabrir el hilo',
        [{ text: 'Aceptar' }]
      );

    }
  }

  // Confirmación para borrar un hilo
  async confirmDeleteThread(thread: ForumThread) {
    await this.modalService.showAlert(
      'warning',
      `¿Estás seguro de que quieres borrar el hilo “${thread.title}”?`,
      [
        {
          text: 'Sí',
          handler: async () => {
            await this.deleteThread(thread.id);
          }
        },
        { text: 'No' }
      ]
    );
  }

  // Borrar un hilo
  private async deleteThread(threadId: number) {
    try {
      const result = await this.forumService.deleteThread(threadId);

      if (result.success) {
        this.modalService.showToast('Has eliminado el hilo', "success");
        await this.loadThreads();

      } else {
        console.error("Error al borrar el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al borrar el hilo',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error('Error al borrar el hilo:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al borrar el hilo',
        [{ text: 'Aceptar' }]
      );

    }
  }

}