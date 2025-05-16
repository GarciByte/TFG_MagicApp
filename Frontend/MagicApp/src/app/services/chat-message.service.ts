import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Result } from '../models/result';
import { GlobalChatMessage } from '../models/global-chat-message';
import { ChatList } from '../models/chat-list';
import { ChatMessage } from '../models/chat-message';
import { ConversationRequest } from '../models/conversation-request';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {

  constructor(private api: ApiService) { }

  // Obtener todos los mensajes del chat global
  async getAllGlobalMessages(): Promise<Result<any[]>> {
    return this.api.get<GlobalChatMessage[]>(`ChatMessage/allGlobalMessages`);
  }

  // Obtener la lista de chats para un usuario
  async getChatsList(): Promise<Result<any[]>> {
    return this.api.get<ChatList[]>(`ChatMessage/chatList`);
  }

  // Obtener todos los mensajes entre dos usuarios
  async GetConversation(conversationRequest: ConversationRequest): Promise<Result<any[]>> {
    const body = { otherUserId: conversationRequest.OtherUserId, otherUserNickname: conversationRequest.OtherUserNickname };
    return this.api.post<ChatMessage[]>(`ChatMessage/conversation`, body, 'application/json');
  }

  // Borrar conversación de un usuario
  deleteConversation(otherUserId: number): Promise<Result<void>> {
    return this.api.delete<void>(`ChatMessage/conversation`, { otherUserId });
  }

}