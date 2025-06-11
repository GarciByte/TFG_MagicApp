import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { IonContent, IonInput, IonItem, IonButton, IonIcon, IonList, IonLabel, IonFooter, IonAvatar, IonCard, IonCardContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { MsgType, WebSocketMessage } from 'src/app/models/web-socket-message';
import { GlobalChatMessage } from 'src/app/models/global-chat-message';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { ChatMessageService } from 'src/app/services/chat-message.service';
import { ModalService } from 'src/app/services/modal.service';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-global-chat',
  imports: [IonCardContent, IonCard, IonAvatar, IonFooter, IonLabel, IonList, IonIcon, IonButton, IonItem, IonInput, IonContent, FormsModule, CommonModule, SidebarComponent],
  templateUrl: './global-chat.component.html',
  styleUrls: ['./global-chat.component.css'],
  standalone: true,
})
export class GlobalChatComponent implements OnInit {

  chatSubscription: Subscription;
  chatMessages: any[] = [];
  chatInput: string = "";
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

    // Obtener todos los mensajes
    await this.getAllMessages();

    // Nuevos mensajes en el chat
    this.chatSubscription = this.webSocketService.globalChatSubject.subscribe(async (message: GlobalChatMessage) => {

      const avatarUrl = await this.userService.getUserAvatar(message.UserId);

      this.chatMessages.push({
        UserId: message.UserId,
        Nickname: message.Nickname,
        Content: message.Content,
        AvatarUrl: avatarUrl
      });
    });
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  // Envía mensajes del chat
  sendMessage(): void {
    if (!(this.chatInput.trim() === "")) {

      const chatMessage: GlobalChatMessage = {
        UserId: this.user.userId,
        Nickname: this.user.nickname,
        Content: this.chatInput
      };

      const message: WebSocketMessage = {
        Type: MsgType.GlobalChat,
        Content: chatMessage
      };

      this.webSocketService.sendRxjs(message);
      this.chatInput = "";
    }
  }

  // Obtener todos los mensajes
  async getAllMessages(): Promise<void> {
    try {
      const result = await this.chatMessageService.getAllGlobalMessages();

      if (result.success) {
        const messages = result.data;

        for (const message of messages) {
          const avatarUrl = await this.userService.getUserAvatar(message.userId);

          this.chatMessages.push({
            UserId: message.userId,
            Nickname: message.nickname,
            Content: message.content,
            AvatarUrl: avatarUrl
          });
        }

      } else {

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