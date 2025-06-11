import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { ChatWithAiMessage } from 'src/app/models/chat-with-ai-message';
import { ChatWithAiRequest } from 'src/app/models/chat-with-ai-request';
import { ChatWithAiResponse } from 'src/app/models/chat-with-ai-response';
import { User } from 'src/app/models/user';
import { WebSocketMessage, MsgType } from 'src/app/models/web-socket-message';
import { AuthService } from 'src/app/services/auth.service';
import { ChatWithAiService } from 'src/app/services/chat-with-ai.service';
import { ModalService } from 'src/app/services/modal.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CommonModule } from '@angular/common';
import { IonContent, IonFooter, IonSpinner, IonButton, IonCard, IonCardContent, IonIcon, IonItem } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-chat-with-ai',
  imports: [IonItem, IonIcon, IonCardContent, IonCard, IonButton, CommonModule, FormsModule, IonContent, IonFooter, IonSpinner, SidebarComponent, TranslateModule],
  templateUrl: './chat-with-ai.component.html',
  styleUrls: ['./chat-with-ai.component.css'],
  standalone: true,
})
export class ChatWithAiComponent implements OnInit, OnDestroy {

  @ViewChild('messagesContainer', { static: true, read: ElementRef }) private messagesContainer: ElementRef;
  error$: Subscription;
  chatSubscription: Subscription;

  chatMessages: ChatWithAiMessage[] = [];
  chatInput: string = '';

  user: User;
  waitingResponse: boolean = false;
  lang: string;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private modalService: ModalService,
    private chatWithAiService: ChatWithAiService,
    private webSocketService: WebsocketService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private cfg: ConfigService
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
    this.lang = this.cfg.config.lang;

    // Cargar historial de mensajes
    await this.getAllMessages();

    // Nuevos mensajes en el chat
    this.chatSubscription = this.webSocketService.chatWithAiSubject.subscribe(
      (message: ChatWithAiResponse) => {
        this.waitingResponse = false;
        this.animateAiResponse(message.Response);
      }
    );
  }

  // Obtener todos los mensajes
  async getAllMessages(): Promise<void> {
    try {
      const result = await this.chatWithAiService.GetAllMessages(this.user.userId);

      if (result.success && result.data) {
        this.chatMessages = result.data;

        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);

      } else {
        console.error("Error al obtener todos los mensajes:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('MODALS.FETCH_CHAT_ERROR'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error al obtener todos los mensajes:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('MODALS.FETCH_CHAT_ERROR'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Envía mensajes del chat
  async sendMessage(): Promise<void> {
    if (this.chatInput.trim() === '') {
      return;
    }

    const newMessage: ChatWithAiMessage = {
      userId: this.user.userId,
      role: 'user',
      content: this.chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    this.chatMessages.push(newMessage);

    this.cdr.detectChanges();
    setTimeout(() => this.scrollToBottom(), 50);

    const chatRequest: ChatWithAiRequest = {
      userId: this.user.userId,
      prompt: this.chatInput.trim(),
      lang: this.lang
    };

    const wsMessage: WebSocketMessage = {
      Type: MsgType.ChatWithAI,
      Content: chatRequest
    };

    this.webSocketService.sendRxjs(wsMessage);
    this.chatInput = '';
    this.waitingResponse = true;
  }

  // Convierte Markdown a HTML seguro
  toSafeHtml(markdown: string): SafeHtml {
    let html = marked.parse(markdown || '') as string;
    html = html.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Abrir enlaces en una nueva pestaña
  async onLinkClick(event: MouseEvent): Promise<void> {
    let element = event.target as HTMLElement;
    while (element && element.tagName.toLowerCase() !== 'a') {
      element = element.parentElement as HTMLElement;
    }
    if (element && element.tagName.toLowerCase() === 'a') {
      const href = (element as HTMLAnchorElement).href;
      if (href) {
        event.preventDefault();
        if (Capacitor.isNativePlatform()) {
          await Browser.open({ url: href });
        } else {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    }
  }

  // Scroll al final del chat
  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) { }
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    if (this.error$) {
      this.error$.unsubscribe();
    }

    this.CancelAiRequest();
  }

  // Cancela la petición de IA en curso
  async CancelAiRequest() {
    const wsMessage = {
      Type: MsgType.CancelAIMessage,
      Content: 'CancelAIMessage'
    };
    this.webSocketService.sendRxjs(wsMessage);
  }

  // Animación de escritura para la IA
  private animateAiResponse(fullText: string) {
    const aiMessage: ChatWithAiMessage = {
      userId: this.user.userId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    this.chatMessages.push(aiMessage);
    this.cdr.detectChanges();

    let index = 0;
    const total = fullText.length;
    const speed = 3;
    let lastNewlineCount = 0;

    const typeNextChar = () => {
      const charsToAdd = Math.min(2, total - index);
      for (let i = 0; i < charsToAdd; i++) {
        if (index < total) {
          aiMessage.content += fullText.charAt(index);
          index++;
        }
      }

      this.cdr.detectChanges();

      const currentNewlineCount = (aiMessage.content.match(/\n/g) || []).length;
      if (currentNewlineCount > lastNewlineCount) {
        lastNewlineCount = currentNewlineCount;
        setTimeout(() => this.scrollToBottom(), 10);
      }

      if (index < total) {
        setTimeout(typeNextChar, speed);

      } else {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    };

    setTimeout(typeNextChar, speed);
  }

}