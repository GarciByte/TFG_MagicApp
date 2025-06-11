import { Injectable } from '@angular/core';
import { MsgType, WebSocketMessage } from '../models/web-socket-message';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { ModalService } from './modal.service';
import { GlobalChatMessage } from '../models/global-chat-message';
import { ChatMessage } from '../models/chat-message';
import { ChatWithAiResponse } from '../models/chat-with-ai-response';
import { ApiService } from './api.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private modalService: ModalService, private api: ApiService, private translate: TranslateService) { }

  rxjsSocket: WebSocketSubject<WebSocketMessage> | null = null;
  public activePrivateChatUserId: number | null = null;

  // Eventos de conexión
  public connected = new Subject<void>();
  public disconnected = new Subject<void>();
  public error = new Subject<void>();

  // Notificar mensajes del chat global
  public globalChatSubject = new Subject<GlobalChatMessage>();

  // Notificar mensajes del chat de la IA
  public chatWithAiSubject = new Subject<ChatWithAiResponse>();

  // Notificar comentario sobre una carta de la IA
  public CardDetailsWithAiSubject = new Subject<ChatWithAiResponse>();

  // Notificar mensajes del chat privado
  public chatSubject = new Subject<ChatMessage>();

  private onConnected() {
    this.connected.next();
  }

  private onMessageReceived(message: WebSocketMessage) {
    //console.log('Mensaje recibido:', message);

    // Según el tipo de mensaje
    switch (message.Type) {

      case MsgType.Connection:
        console.log(message.Content);
        break;

      case MsgType.GlobalChat:
        this.globalChatSubject.next(message.Content);
        break;

      case MsgType.PrivateChat:
        this.chatSubject.next(message.Content);
        break;

      case MsgType.UserBanned:
        this.handleUserBan();
        break;

      case MsgType.ForumNotification:
        this.handleForumNotification(message);
        break;

      case MsgType.ChatNotification:
        this.handleChatNotification(message.Content);
        break;

      case MsgType.ChatWithAI:
        this.chatWithAiSubject.next(message.Content);
        break;

      case MsgType.CardDetailsWithAI:
        this.CardDetailsWithAiSubject.next(message.Content);
        break;

      default:
        console.warn("Mensaje no reconocido:", message.Type);
        break;
    }
  }

  // Prohibición de un usuario
  async handleUserBan(): Promise<void> {
    this.modalService.showAlert(
      'error',
      this.translate.instant('MODALS.USER_BANNED.TITLE'),
      [{ text: this.translate.instant('COMMON.ACCEPT') }]
    );

    this.error.next();
  }

  // Nuevo mensaje de chat
  async handleChatNotification(message: ChatMessage): Promise<void> {
    if (this.activePrivateChatUserId !== null && this.activePrivateChatUserId === message.SenderId) {
      return;
    }
    this.modalService.showToast(this.translate.instant('TOAST.NEW_MESSAGE_FROM', { nickname: message.SenderNickname }),
      'info'
    );
  }

  // Nuevo mensaje del hilo al que está suscrito el usuario
  async handleForumNotification(message: WebSocketMessage): Promise<void> {
    this.modalService.showToast(
      this.translate.instant('TOAST.NEW_THREAD_MESSAGE', { content: message.Content }),
      'info'
    );
  }

  private onError(error: any) {
    console.error("Error en WebSocket:", error);
    this.tryReconnect(10);
  }

  // Intentar reconectar la conexión
  private async tryReconnect(attemptsLeft: number): Promise<void> {
    if (attemptsLeft <= 0) {

      this.modalService.showAlert(
        'error',
        this.translate.instant('MODALS.CONNECTION_LOST'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

      this.error.next();
      return;
    }

    try {
      const token = this.api.accessToken;
      if (!token) throw new Error('Token no disponible');

      const isAuthenticated = true;
      await this.connectRxjs(token, isAuthenticated);
      console.log('Re-conexión exitosa');

    } catch (reconError) {
      console.error('Fallo reconexión', reconError);

      await this.delay(1000);
      return this.tryReconnect(attemptsLeft - 1);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }

  private onDisconnected() {
    this.disconnected.next();
  }

  isConnectedRxjs(): boolean {
    return this.rxjsSocket != null && !this.rxjsSocket.closed;
  }

  connectRxjs(accessToken: string, isAuthenticated: boolean): Promise<void> {
    return new Promise((resolve, reject) => {

      if (!this.isConnectedRxjs() && isAuthenticated) {
        const url = `${environment.socketUrl}?token=${accessToken}`;

        this.rxjsSocket = webSocket({
          url: url,

          // Evento de apertura de conexión
          openObserver: {
            next: () => {
              this.onConnected();
              resolve();
            }
          },

          serializer: (value: WebSocketMessage) => JSON.stringify(value),
          deserializer: (event: MessageEvent) => JSON.parse(event.data),
        });

        this.rxjsSocket.subscribe({

          // Evento de mensaje recibido
          next: (message) => this.onMessageReceived(message),

          // Evento de error generado
          error: (error) => {
            this.onError(error);
            reject(error);
          },

          // Evento de cierre de conexión
          complete: () => this.onDisconnected(),
        });

      } else {
        reject(new Error('Imposible iniciar conexión WebSocket'));
      }
    });
  }

  // Método para enviar mensajes
  async sendRxjs(message: WebSocketMessage) {

    if (this.isConnectedRxjs() && this.rxjsSocket) {
      this.rxjsSocket.next(message);
      //console.log("Mensaje enviado:", message);

    } else {
      this.modalService.showAlert(
        'error',
        this.translate.instant('MODALS.CANNOT_CONNECT'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );
    }
  }

  disconnectRxjs(): void {
    if (this.rxjsSocket) {
      this.rxjsSocket.complete();
      this.rxjsSocket = null;
    }
  }

}