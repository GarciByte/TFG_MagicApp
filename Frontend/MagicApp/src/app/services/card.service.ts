import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CardImage } from '../models/card-image';
import { Result } from '../models/result';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private api: ApiService) {}

  // Buscar cartas por nombre
  async searchCardImages(name: string): Promise<Result<CardImage[]>> {
    return this.api.get<CardImage[]>(`Cards/search`, { name });
  }

  // Obtener información de una carta por su ID
  async getCardById(id: string): Promise<Result<CardImage>> {
    return this.api.get<CardImage>(`Cards/${id}`);
  }
  
}