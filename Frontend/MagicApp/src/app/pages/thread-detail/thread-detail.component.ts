import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-thread-detail',
  imports: [IonContent, IonCard, IonAvatar, IonCardHeader, IonIcon, IonItem, IonLabel,
    IonCardContent, IonButton, CommonModule, ReactiveFormsModule, IonTextarea, TranslateModule],
  templateUrl: './thread-detail.component.html',
  styleUrls: ['./thread-detail.component.css'],
  standalone: true,
})
export class ThreadDetailComponent implements OnInit, OnDestroy {
  error$: Subscription;
  threadId!: number;
  threadDetail: ForumThreadDetail;
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
    private webSocketService: WebsocketService,
    public translate: TranslateService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

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
        this.translate.instant('THREAD_DETAIL.ERROR_LOADING'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
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
            this.translate.instant('THREAD_DETAIL.ERROR_LOADING'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

          this.navCtrl.navigateRoot(['/forum']);
          return
        }

        this.setupPagination();

      } else {
        console.error("Error al cargar el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('THREAD_DETAIL.ERROR_LOADING'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

        this.navCtrl.navigateRoot(['/forum']);
      }

    } catch (error) {
      console.error('Error al cargar el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('THREAD_DETAIL.ERROR_LOADING'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
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
        this.modalService.showToast(
          this.translate.instant('THREAD_DETAIL.COMMENT_ADDED'),
          "success"
        );
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
          this.translate.instant('THREAD_DETAIL.ERROR_ADD_COMMENT'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al añadir el comentario:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('THREAD_DETAIL.ERROR_ADD_COMMENT'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
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
          this.modalService.showToast(
            this.translate.instant('THREAD_DETAIL.SUBSCRIBE_SUCCESS'),
            "success"
          );

        } else {
          console.error("Error al suscribirse al hilo:", result.error);

          this.modalService.showAlert(
            'error',
            this.translate.instant('THREAD_DETAIL.ERROR_TOGGLE_SUBSCRIBE'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

        }

      } else {
        const result = await this.forumService.unsubscribe(this.threadId);

        if (result.success) {
          this.threadDetail.subscribed = false;
          this.modalService.showToast(
            this.translate.instant('THREAD_DETAIL.UNSUBSCRIBE_SUCCESS'),
            "success"
          );

        } else {
          console.error("Error al cancelar la suscripción del hilo:", result.error);

          this.modalService.showAlert(
            'error',
            this.translate.instant('THREAD_DETAIL.ERROR_TOGGLE_SUBSCRIBE'),
            [{ text: this.translate.instant('COMMON.ACCEPT') }]
          );

        }
      }

    } catch (error) {
      console.error('Error al cambiar el estado de suscripción del hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('THREAD_DETAIL.ERROR_TOGGLE_SUBSCRIBE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Confirmación para cerrar o reabrir el hilo
  async confirmToggleCloseThread() {
    if (this.threadDetail.isClosed) {

      // Reabrir
      await this.modalService.showAlert(
        'warning',
        this.translate.instant('THREAD_DETAIL.CONFIRM_REOPEN', { title: this.threadDetail.title }),
        [
          { text: this.translate.instant('COMMON.YES'), handler: async () => await this.openThreadAdmin() },
          { text: this.translate.instant('COMMON.NO') }
        ]
      );

    } else {

      // Cerrar
      await this.modalService.showAlert(
        'warning',
        this.translate.instant('THREAD_DETAIL.CONFIRM_CLOSE', { title: this.threadDetail.title }),
        [
          { text: this.translate.instant('COMMON.YES'), handler: async () => await this.closeThreadAdmin() },
          { text: this.translate.instant('COMMON.NO') }
        ]
      );

    }
  }

  // Cerrar el hilo
  private async closeThreadAdmin() {
    try {
      const result = await this.forumService.closeThread(this.threadId);

      if (result.success) {
        this.modalService.showToast(
          this.translate.instant('THREAD_DETAIL.THREAD_CLOSED'),
          "success"
        );
        this.threadDetail.isClosed = true;

      } else {
        console.error("Error al cerrar el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('THREAD_DETAIL.ERROR_CLOSE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al cerrar el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('THREAD_DETAIL.ERROR_CLOSE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Reabrir el hilo
  private async openThreadAdmin() {
    try {
      const result = await this.forumService.openThread(this.threadId);

      if (result.success) {
        this.modalService.showToast(
          this.translate.instant('THREAD_DETAIL.THREAD_REOPENED'),
          "success"
        );
        this.threadDetail.isClosed = false;

      } else {
        console.error("Error al reabrir el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('THREAD_DETAIL.ERROR_REOPEN'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al reabrir el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('THREAD_DETAIL.ERROR_REOPEN'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Confirmación para borrar el comentario
  async confirmDeleteComment(comment: ForumComment) {
    await this.modalService.showAlert(
      'warning',
      this.translate.instant('THREAD_DETAIL.CONFIRM_DELETE_COMMENT'),
      [
        { text: this.translate.instant('COMMON.YES'), handler: async () => await this.deleteCommentAdmin(comment.id) },
        { text: this.translate.instant('COMMON.NO') }
      ]
    );
  }

  // Borrar el comentario
  private async deleteCommentAdmin(commentId: number) {
    try {
      const result = await this.forumService.deleteComment(commentId);

      if (result.success) {
        this.modalService.showToast(
          this.translate.instant('THREAD_DETAIL.COMMENT_DELETED'),
          "success"
        );
        await this.loadThreadDetail();

      } else {
        console.error("Error al borrar el comentario:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('THREAD_DETAIL.ERROR_DELETE_COMMENT'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error('Error al borrar el comentario:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('THREAD_DETAIL.ERROR_DELETE_COMMENT'),
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