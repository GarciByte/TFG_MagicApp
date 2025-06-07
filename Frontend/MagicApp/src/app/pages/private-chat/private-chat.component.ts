import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ChatMessage } from 'src/app/models/chat-message';
import { ConversationRequest } from 'src/app/models/conversation-request';
import { User } from 'src/app/models/user';
import { MsgType, WebSocketMessage } from 'src/app/models/web-socket-message';
import { AuthService } from 'src/app/services/auth.service';
import { ChatMessageService } from 'src/app/services/chat-message.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CommonModule, Location } from '@angular/common';
import { IonContent, IonButton, IonCard, IonCardContent, IonFooter, IonInput, IonIcon, IonItem, IonLabel, IonAvatar, IonList } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-private-chat',
  imports: [IonList, IonAvatar, IonLabel, IonItem, IonIcon, IonInput, IonFooter, IonCardContent, IonCard, IonButton, IonContent, CommonModule, FormsModule],
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css'],
  standalone: true,
})
export class PrivateChatComponent implements OnInit {

  chatSubscription: Subscription;
  chatMessages: any[] = [];
  chatInput: string = "";
  user: User;
  otherUser: User;
  routeQueryMap$: Subscription;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private webSocketService: WebsocketService,
    private userService: UserService,
    private chatMessageService: ChatMessageService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.user = await this.authService.getUser();

    // Nuevos mensajes en el chat
    this.chatSubscription = this.webSocketService.chatSubject.subscribe(async (message: ChatMessage) => {

      const avatarUrl = await this.userService.getUserAvatar(message.SenderId);

      this.chatMessages.push({
        SenderId: message.SenderId,
        SenderNickname: message.SenderNickname,
        ReceiverId: message.ReceiverId,
        ReceiverNickname: message.ReceiverNickname,
        Content: message.Content,
        AvatarUrl: avatarUrl
      });
    });

    this.routeQueryMap$ = this.route.queryParamMap.subscribe(queryMap => this.init(queryMap));
  }

  // Obtener datos del chat
  async init(queryMap: ParamMap) {
    const userId = parseInt(queryMap.get("id"));

    if (!userId) {
      this.navCtrl.navigateRoot(['/menu']);
    }

    if (this.user.userId === userId) {
      this.navCtrl.navigateRoot(['/menu']);
    }

    // Obtener datos del otro usuario
    await this.getUser(userId);

    // Marcar el chat activo
    this.webSocketService.activePrivateChatUserId = this.otherUser.userId;

    // Obtener todos los mensajes
    await this.getAllMessages();

    console.log(this.chatMessages);

    // Borra el parámetro de ruta
    const currentUrl = this.location.path();
    const baseUrl = currentUrl.split('?')[0];
    this.location.replaceState(baseUrl);
  }

  ngOnDestroy(): void {
    this.webSocketService.activePrivateChatUserId = null;
    
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    if (this.routeQueryMap$) {
      this.routeQueryMap$.unsubscribe();
    }
  }

  // Envía mensajes del chat
  sendMessage(): void {
    if (!(this.chatInput.trim() === "")) {

      const chatMessage: ChatMessage = {
        SenderId: this.user.userId,
        SenderNickname: this.user.nickname,
        ReceiverId: this.otherUser.userId,
        ReceiverNickname: this.otherUser.nickname,
        Content: this.chatInput
      };

      const message: WebSocketMessage = {
        Type: MsgType.PrivateChat,
        Content: chatMessage
      };

      this.webSocketService.sendRxjs(message);
      this.chatInput = "";

      const notification: ChatMessage = {
        SenderId: this.user.userId,
        SenderNickname: this.user.nickname,
        ReceiverId: this.otherUser.userId,
        ReceiverNickname: this.otherUser.nickname,
        Content: ""
      }

      const messageNotification: WebSocketMessage = {
        Type: MsgType.ChatNotification,
        Content: notification
      };

      this.webSocketService.sendRxjs(messageNotification);
    }
  }

  // Obtener datos del otro usuario
  async getUser(userId: number): Promise<void> {
    try {
      const result = await this.userService.getUserById(userId);

      if (result.success) {
        this.otherUser = result.data;

      } else {
        console.error("Error al buscar el usuario:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al obtener los datos del usuario',
          [{ text: 'Aceptar' }]
        );
      }

    } catch (error) {
      console.error("Error al buscar el usuario:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener los datos del usuario',
        [{ text: 'Aceptar' }]
      );
    }
  }

  // Obtener todos los mensajes
  async getAllMessages(): Promise<void> {
    try {

      const conversationRequest: ConversationRequest = {
        OtherUserId: this.otherUser.userId,
        OtherUserNickname: this.otherUser.nickname
      }

      const result = await this.chatMessageService.GetConversation(conversationRequest);

      if (result.success) {
        const messages = result.data;

        for (const message of messages) {
          const avatarUrl = await this.userService.getUserAvatar(message.senderId);

          this.chatMessages.push({
            SenderId: message.senderId,
            SenderNickname: message.senderNickname,
            ReceiverId: message.receiverId,
            ReceiverNickname: message.receiverNickname,
            Content: message.content,
            AvatarUrl: avatarUrl
          });
        }

      } else {
        console.error("Error al obtener todos los mensajes:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al obtener todos los mensajes',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error("Error al obtener todos los mensajes:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al obtener todos los mensajes',
        [{ text: 'Aceptar' }]
      );

    }
  }

}
