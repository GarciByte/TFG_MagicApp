import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CardImage } from '../models/card-image';
import { Result } from '../models/result';
import { CardDetail } from '../models/card-detail';
import { CardFilter } from '../models/card-filter';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private api: ApiService) { }

  // Buscar cartas por nombre
  async searchCardImages(filter: CardFilter): Promise<Result<CardImage[]>> {
    return this.api.post<CardImage[]>("Cards/search", filter);
  }

  // Obtener información de una carta por su ID
  async getCardById(id: string): Promise<Result<CardDetail>> {
    return this.api.get<CardDetail>(`Cards/${id}`);
  }

}