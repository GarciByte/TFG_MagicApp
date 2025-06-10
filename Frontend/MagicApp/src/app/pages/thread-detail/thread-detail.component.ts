import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CreateForumComment } from 'src/app/models/create-forum-comment';
import { ForumComment } from 'src/app/models/forum-comment';
import { ForumThreadDetail } from 'src/app/models/forum-thread-detail';
import { AuthService } from 'src/app/services/auth.service';
import { ForumService } from 'src/app/services/forum.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import {
  IonButton, IonCardContent, IonLabel, IonItem, IonIcon, IonCardHeader,
  IonAvatar, IonCard, IonContent, IonTextarea
} from "@ionic/angular/standalone";
import { MsgType, WebSocketMessage } from 'src/app/models/web-socket-message';
import { WebsocketService } from 'src/app/services/websocket.service';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-thread-detail',
  imports: [IonContent, IonCard, IonAvatar, IonCardHeader, IonIcon, IonItem, IonLabel,
    IonCardContent, IonButton, CommonModule, ReactiveFormsModule, IonTextarea, SidebarComponent],
  templateUrl: './thread-detail.component.html',
  styleUrls: ['./thread-detail.component.css'],
  standalone: true,
})
export class ThreadDetailComponent implements OnInit {

  threadId!: number;
  threadDetail!: ForumThreadDetail;
  isAdmin = false;
  apiImg = environment.apiImg;
  commentForm: FormGroup;

  // Paginación
  page = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private modalService: ModalService,
    private forumService: ForumService,
    private webSocketService: WebsocketService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }
    await this.checkAdmin();
    await this.loadThreadDetail();
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

  // Cargar el hilo
  async loadThreadDetail() {
    const threadIdParam = this.route.snapshot.paramMap.get('id');
    const numericId = Number(threadIdParam);
    const isValid = threadIdParam !== null && Number.isInteger(numericId) && numericId > 0;

    if (!isValid) {

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al cargar el hilo',
        [{ text: 'Aceptar' }]
      );

      this.navCtrl.navigateRoot(['/forum']);
      return
    }

    this.threadId = numericId;
    try {

      const result = await this.forumService.getThreadDetail(this.threadId);

      if (result.success) {
        this.threadDetail = result.data;

        if (!this.threadDetail) {

          this.modalService.showAlert(
            'error',
            'Se ha producido un error al cargar el hilo',
            [{ text: 'Aceptar' }]
          );

          this.navCtrl.navigateRoot(['/forum']);
          return
        }

        this.setupPagination();

      } else {
        console.error("Error al cargar el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al cargar el hilo',
          [{ text: 'Aceptar' }]
        );

        this.navCtrl.navigateRoot(['/forum']);
      }

    } catch (error) {
      console.error('Error al cargar el hilo:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al cargar el hilo',
        [{ text: 'Aceptar' }]
      );

      this.navCtrl.navigateRoot(['/forum']);

    }
  }

  // Calcular paginación
  private setupPagination(): void {
    const totalCommentsExcludingFirst = (this.threadDetail.comments?.length || 0) - 1;
    this.totalPages = totalCommentsExcludingFirst > 0 ? Math.ceil(totalCommentsExcludingFirst / this.pageSize) : 1;

    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }

  // Comentarios de la página actual
  get paginatedComments(): ForumComment[] {
    if (!this.threadDetail?.comments) {
      return [];
    }
    const allCommentsExcludingFirst = this.threadDetail.comments.slice(1);
    const startIndex = (this.page - 1) * this.pageSize;
    return allCommentsExcludingFirst.slice(startIndex, startIndex + this.pageSize);
  }

  // Cambio de página
  goToPage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
    }
  }

  // Refrescar el hilo
  async refreshThread(): Promise<void> {
    this.page = 1;
    await this.loadThreadDetail();
  }

  // Crear un nuevo comentario
  async submitComment() {
    if (this.commentForm.invalid) {
      return;
    }

    const createForumComment: CreateForumComment = {
      threadId: this.threadId,
      content: this.commentForm.value.content
    };

    try {
      const result = await this.forumService.addComment(this.threadId, createForumComment);

      if (result.success) {
        this.modalService.showToast('Comentario añadido', "success");
        this.commentForm.reset();

        const message: WebSocketMessage = {
          Type: MsgType.ForumNotification,
          Content: this.threadId,
        };

        this.webSocketService.sendRxjs(message);

        await this.loadThreadDetail();

      } else {
        console.error("Error al añadir el comentario:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al añadir el comentario',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error('Error al añadir el comentario:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al añadir el comentario',
        [{ text: 'Aceptar' }]
      );

    }
  }

  // Suscribirse/Desuscribirse del hilo
  async toggleSubscribe() {
    const currentlySubscribed = this.threadDetail.subscribed;

    try {

      if (!currentlySubscribed) {
        const result = await this.forumService.subscribe(this.threadId);

        if (result.success) {
          this.threadDetail.subscribed = true;
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
        const result = await this.forumService.unsubscribe(this.threadId);

        if (result.success) {
          this.threadDetail.subscribed = false;
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

  // Confirmación para cerrar o reabrir el hilo
  async confirmToggleCloseThread() {
    if (this.threadDetail.isClosed) {

      // Reabrir
      await this.modalService.showAlert(
        'warning',
        `¿Reabrir el hilo “${this.threadDetail.title}”?`,
        [
          {
            text: 'Sí',
            handler: async () => {
              await this.openThreadAdmin();
            }
          },
          { text: 'No' }
        ]
      );

    } else {

      // Cerrar
      await this.modalService.showAlert(
        'warning',
        `¿Cerrar el hilo “${this.threadDetail.title}”?`,
        [
          {
            text: 'Sí',
            handler: async () => {
              await this.closeThreadAdmin();
            }
          },
          { text: 'No' }
        ]
      );

    }
  }

  // Cerrar el hilo
  private async closeThreadAdmin() {
    try {
      const result = await this.forumService.closeThread(this.threadId);

      if (result.success) {
        this.modalService.showToast('Has cerrado el hilo', "success");
        this.threadDetail.isClosed = true;

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

  // Reabrir el hilo
  private async openThreadAdmin() {
    try {
      const result = await this.forumService.openThread(this.threadId);

      if (result.success) {
        this.modalService.showToast('Has reabierto el hilo', "success");
        this.threadDetail.isClosed = false;

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

  // Confirmación para borrar el comentario
  async confirmDeleteComment(comment: ForumComment) {
    await this.modalService.showAlert(
      'warning',
      `¿Borrar este comentario?`,
      [
        {
          text: 'Sí',
          handler: async () => {
            await this.deleteCommentAdmin(comment.id);
          }
        },
        { text: 'No' }
      ]
    );
  }

  // Borrar el comentario
  private async deleteCommentAdmin(commentId: number) {
    try {
      const result = await this.forumService.deleteComment(commentId);

      if (result.success) {
        this.modalService.showToast('Has eliminado el comentario', "success");
        await this.loadThreadDetail();

      } else {
        console.error("Error al borrar el comentario:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al borrar el comentario',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error('Error al borrar el comentario:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al borrar el comentario',
        [{ text: 'Aceptar' }]
      );

    }
  }

}