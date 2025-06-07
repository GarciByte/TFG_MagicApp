import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Result } from '../models/result';
import { ChatWithAiMessage } from '../models/chat-with-ai-message';

@Injectable({
  providedIn: 'root'
})
export class ChatWithAiService {

  constructor(private api: ApiService) { }

  // Obtener historial de mensajes del chat de la IA
  async GetAllMessages(userId: number): Promise<Result<ChatWithAiMessage[]>> {
    return this.api.get<ChatWithAiMessage[]>(`ChatWithAi/${userId}`);
  }
  
}