import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ChatMessageService } from 'src/app/services/chat-message.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ChatList } from 'src/app/models/chat-list';
import { IonCardContent, IonCardHeader, IonAvatar, IonCardTitle, IonCard, IonContent, IonButton, IonIcon } from "@ionic/angular/standalone";
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-private-chats-list',
  imports: [IonIcon, IonButton, IonContent, IonCard, IonCardTitle, IonAvatar, IonCardHeader, IonCardContent, CommonModule, SidebarComponent, TranslateModule],
  templateUrl: './private-chats-list.component.html',
  styleUrls: ['./private-chats-list.component.css'],
  standalone: true,
})
export class PrivateChatsListComponent implements OnInit, OnDestroy {
  error$: Subscription;
  chatSubscription: Subscription;
  chatList: ChatList[] = [];
  user: User;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private webSocketService: WebsocketService,
    private userService: UserService,
    private chatMessageService: ChatMessageService,
    private modalService: ModalService,
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

    // Obtener la lista de chats del usuario
    await this.getChatsList();

    // Nuevos mensajes en el chat
    this.chatSubscription = this.webSocketService.chatSubject.subscribe(async () => {
      await this.getChatsList();
    });
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

  // Obtener la lista de chats del usuario
  async getChatsList(): Promise<void> {
    try {
      const result = await this.chatMessageService.getChatsList();

      if (result.success) {
        this.chatList = [];
        const chatList = result.data;

        for (const chat of chatList) {
          const avatarUrl = await this.userService.getUserAvatar(chat.receiverId);

          this.chatList.push({
            ReceiverId: chat.receiverId,
            ReceiverNickname: chat.receiverNickname,
            LastMessage: chat.lastMessage,
            LastTimestamp: chat.lastTimestamp,
            AvatarUrl: avatarUrl
          });
        }

      } else {
        console.error("Error al obtener la lista de chats del usuario:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('PRIVATE_CHATS_LIST.ERROR_GET_LIST'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error al obtener la lista de chats del usuario:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('PRIVATE_CHATS_LIST.ERROR_GET_LIST'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Redirigir al chat de ese usuario
  openChat(userId: number): void {
    this.navCtrl.navigateRoot(
      ['/private-chat'],
      { queryParams: { id: userId } }
    );
  }

  // Alerta de borrado de conversación
  async confirmDelete(otherUserId: number, event: MouseEvent) {
    event.stopPropagation();

    await this.modalService.showAlert(
      'warning',
      this.translate.instant('PRIVATE_CHATS_LIST.CONFIRM_DELETE_TITLE'),
      [
        {
          text: this.translate.instant('PRIVATE_CHATS_LIST.DELETE'),
          handler: async () => {
            await this.deleteChat(otherUserId);
          }
        },
        { text: this.translate.instant('PRIVATE_CHATS_LIST.CANCEL') }
      ]
    );
  }

  // Borrar conversación de un usuario
  private async deleteChat(otherUserId: number) {
    try {
      const result = await this.chatMessageService.deleteConversation(otherUserId);

      if (result.success) {
        await this.getChatsList();

        this.modalService.showToast(
          this.translate.instant('PRIVATE_CHATS_LIST.TOAST_DELETED'),
          'success'
        );

      } else {
        console.error("Error al borrar la conversación:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('PRIVATE_CHATS_LIST.ERROR_DELETE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error al borrar la conversación:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('PRIVATE_CHATS_LIST.ERROR_DELETE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

}