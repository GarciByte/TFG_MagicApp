import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { IonContent, IonIcon, ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from "@ionic/angular/standalone";
import { marked } from 'marked';
import { Subscription } from 'rxjs';
import { CardDetail } from 'src/app/models/card-detail';
import { ChatWithAiResponse } from 'src/app/models/chat-with-ai-response';
import { MsgType } from 'src/app/models/web-socket-message';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ai-comment-modal',
  imports: [IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonIcon, CommonModule, FormsModule, IonContent, TranslateModule],
  templateUrl: './ai-comment-modal.component.html',
  styleUrls: ['./ai-comment-modal.component.css'],
  standalone: true,
})
export class AiCommentModalComponent implements OnInit {

  @ViewChild('chatContent', { static: false, read: IonContent }) private chatContent: IonContent;
  @Input() card!: CardDetail;
  @Input() lang!: string;

  commentMsg: { role: 'assistant', content: string, timestamp: string };
  waitingResponse = true;
  chatSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private webSocketService: WebsocketService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    // Subscribirse a la respuesta de la IA
    this.chatSubscription = this.webSocketService.CardDetailsWithAiSubject.subscribe(
      (msg: ChatWithAiResponse) => this.onAiResponse(msg.Response)
    );

    await this.sendAiRequest();
  }

  // Solicitar comentario de la carta
  async sendAiRequest() {

    const message = {
      card: this.card,
      lang: this.lang
    }

    const wsMessage = {
      Type: MsgType.CardDetailsWithAI,
      Content: message
    };

    this.webSocketService.sendRxjs(wsMessage);
  }

  // Respuesta de la IA
  private onAiResponse(fullText: string) {
    this.waitingResponse = false;

    this.commentMsg = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    this.cdr.detectChanges();
    this.animateAiResponse(fullText);
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
      this.chatContent.scrollToBottom();
    } catch (err) { }
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    this.CancelAiRequest();
  }

  // Cerrar el modal
  close() {
    this.modalCtrl.dismiss();
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
  private animateAiResponse(fullText: string): void {
    let index = 0;
    const total = fullText.length;
    const speed = 3;
    const chunkSize = 2;

    this.commentMsg.content = '';

    const typeNext = (): void => {
      const chunk = fullText.slice(index, index + chunkSize);

      this.commentMsg.content += chunk;
      index += chunk.length;

      this.cdr.detectChanges();
      this.scrollToBottom();

      if (index < total) {
        requestAnimationFrame(() => setTimeout(typeNext, speed));
      }
    };

    typeNext();
  }

}