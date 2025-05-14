import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Result } from '../models/result';
import { GlobalChatMessage } from '../models/global-chat-message';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {

  constructor(private api: ApiService) { }

  // Obtener todos los mensajes del chat global
  async getAllGlobalMessages(): Promise<Result<any[]>> {
    return this.api.get<GlobalChatMessage[]>(`ChatMessage/allGlobalMessages`);
  }

}