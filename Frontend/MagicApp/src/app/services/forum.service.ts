import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CreateForumComment } from '../models/create-forum-comment';
import { CreateForumThread } from '../models/create-forum-thread';
import { ForumComment } from '../models/forum-comment';
import { ForumThread } from '../models/forum-thread';
import { Result } from '../models/result';
import { ForumThreadDetail } from '../models/forum-thread-detail';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  constructor(private api: ApiService) { }

  // Obtener todos los hilos del foro
  async getAllThreads(): Promise<Result<ForumThread[]>> {
    return this.api.get<ForumThread[]>('Forum/allThreads');
  }

  // Obtener todos los hilos a los que está suscrito el usuario
  async getMySubscriptions(): Promise<Result<ForumThread[]>> {
    return this.api.get<ForumThread[]>('Forum/subscriptions');
  }

  // Obtener los detalles de un hilo
  async getThreadDetail(threadId: number): Promise<Result<ForumThreadDetail>> {
    return this.api.get<ForumThreadDetail>(`Forum/${threadId}`);
  }

  // Crear un nuevo hilo en el foro
  async createThread(dto: CreateForumThread): Promise<Result<ForumThread>> {
    return this.api.post<ForumThread>('Forum', dto, 'application/json');
  }

  // Añadir un comentario a un hilo existente
  async addComment(threadId: number, dto: CreateForumComment): Promise<Result<ForumComment>> {
    dto.threadId = threadId;
    return this.api.post<ForumComment>(`Forum/${threadId}/comments`, dto, 'application/json');
  }

  // Suscribir al usuario al hilo indicado
  async subscribe(threadId: number): Promise<Result<void>> {
    return this.api.post<void>(`Forum/${threadId}/subscribe`);
  }

  // Cancelar la suscripción del usuario al hilo indicado
  async unsubscribe(threadId: number): Promise<Result<void>> {
    return this.api.delete<void>(`Forum/${threadId}/subscribe`);
  }

  // Cerrar un hilo
  async closeThread(threadId: number): Promise<Result<void>> {
    return this.api.post<void>(`Forum/${threadId}/close`);
  }

  // Reabrir un hilo cerrado
  async openThread(threadId: number): Promise<Result<void>> {
    return this.api.post<void>(`Forum/${threadId}/open`);
  }

  // Borrar un comentario
  async deleteComment(commentId: number): Promise<Result<void>> {
    return this.api.delete<void>(`Forum/comments/${commentId}`);
  }

  // Borrar un hilo completo
  async deleteThread(threadId: number): Promise<Result<void>> {
    return this.api.delete<void>(`Forum/${threadId}`);
  }
}