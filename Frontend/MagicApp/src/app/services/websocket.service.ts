import { Injectable } from '@angular/core';
import { MsgType, WebSocketMessage } from '../models/web-socket-message';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private modalService: ModalService) { }

  rxjsSocket: WebSocketSubject<WebSocketMessage> | null = null;

  // Eventos de conexión
  public connected = new Subject<void>();
  public disconnected = new Subject<void>();
  public error = new Subject<void>();

  // Notificar mensajes del chat global
  public globalChatSubject = new Subject<string>();

  private onConnected() {
    this.connected.next();
  }

  private onMessageReceived(message: WebSocketMessage) {
    console.log('Mensaje recibido:', message);

    // Según el tipo de mensaje
    switch (message.Type) {

      case MsgType.Connection:
        console.log(message.Content);
        break;

      case MsgType.GlobalChat:
        this.globalChatSubject.next(message.Content.Content);
        break;

      default:
        console.warn("Mensaje no reconocido:", message.Type);
        break;
    }
  }

  private onError(error: any) {
    console.error("Error en WebSocket:", error);

    this.modalService.showAlert(
      'error',
      'Se ha perdido la conexión con el servidor',
      [{ text: 'Aceptar' }]
    );

    this.error.next();
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
        console.error("No se ha podido iniciar la conexión WebSocket");
        resolve();
      }
    });
  }

  // Método para enviar mensajes
  async sendRxjs(message: WebSocketMessage) {

    if (this.isConnectedRxjs() && this.rxjsSocket) {
      this.rxjsSocket.next(message);
      console.log("Mensaje enviado:", message);

    } else {
      this.modalService.showAlert(
        'error',
        'No se ha podido conectar con el servidor',
        [{ text: 'Aceptar' }]
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