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
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-global-chat',
  imports: [IonCardContent, IonCard, IonAvatar, IonFooter, IonLabel, IonList, IonIcon, IonButton, IonItem, IonInput, IonContent, FormsModule, CommonModule],
  templateUrl: './global-chat.component.html',
  styleUrls: ['./global-chat.component.css'],
  standalone: true,
})
export class GlobalChatComponent implements OnInit {

  chatSubscription: Subscription;
  chatMessages: any[] = [];
  chatInput: string = "";
  user: User;
  apiImg = environment.apiImg

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private webSocketService: WebsocketService,
    private userService: UserService,
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    // Mensajes del chat
    this.chatSubscription = this.webSocketService.globalChatSubject.subscribe(async (message: GlobalChatMessage) => {
      this.chatMessages.push({
        ...message,
        avatarUrl: this.apiImg + await this.getUserAvatar(message.UserId)
      });
    });

    this.user = await this.authService.getUser();
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

  // Obtener avatares de usuarios
  async getUserAvatar(userId: number): Promise<string> {

    if (userId === this.user.userId) {
      return this.user.avatarUrl;
    }

    try {
      const result = await this.userService.getUserById(userId);

      if (result.success) {
        return result.data.avatarUrl;
      }

      return "";

    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return "";
    }
  }

}