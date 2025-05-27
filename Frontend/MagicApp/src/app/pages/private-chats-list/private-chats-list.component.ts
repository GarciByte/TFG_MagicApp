import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-private-chats-list',
  imports: [IonIcon, IonButton, IonContent, IonCard, IonCardTitle, IonAvatar, IonCardHeader, IonCardContent, CommonModule],
  templateUrl: './private-chats-list.component.html',
  styleUrls: ['./private-chats-list.component.css'],
  standalone: true,
})
export class PrivateChatsListComponent implements OnInit {

  chatSubscription: Subscription;
  chatList: ChatList[] = [];
  user: User;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private webSocketService: WebsocketService,
    private userService: UserService,
    private chatMessageService: ChatMessageService,
    private modalService: ModalService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.user = await this.authService.getUser();

    // Obtener la lista de chats del usuario
    await this.getChatsList();

    // Nuevos mensajes en el chat
    this.chatSubscription = this.webSocketService.chatSubject.subscribe(async () => {
      await this.getChatsList();
      console.log("Actualización de chats:", this.chatList);
    });

    console.log(this.chatList);
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
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
          'Se ha producido un error al obtener la lista de chats del usuario',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al obtener la lista de chats del usuario:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener la lista de chats del usuario',
        [{ text: 'Aceptar' }]
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
      '¿Estás seguro de que quieres eliminar esta conversación?',
      [
        {
          text: 'Borrar',
          handler: async () => {
            await this.deleteChat(otherUserId);
          }
        },
        { text: 'Cancelar' }
      ]
    );
  }

  // Borrar conversación de un usuario
  private async deleteChat(otherUserId: number) {
    try {
      const result = await this.chatMessageService.deleteConversation(otherUserId);

      if (result.success) {
        await this.getChatsList();
        this.modalService.showToast("La conversación ha sido borrada", "success");

      } else {
        console.error("Error al borrar la conversación:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al borrar la conversación',
          [{ text: 'Aceptar' }]
        );
      }

    } catch (error) {
      console.error("Error al borrar la conversación:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al borrar la conversación',
        [{ text: 'Aceptar' }]
      );

    }
  }

}