import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DeckRequest } from '../models/deck-request';
import { DeckResponse } from '../models/deck-response';
import { Result } from '../models/result';
import { CardDetail } from '../models/card-detail';

@Injectable({
  providedIn: 'root'
})
export class DeckServiceService {

  constructor(private api: ApiService) { }

  // Obtener un deck a partir de un Id
  async GetDeckById(id: number): Promise<Result<DeckResponse>> {
    const response = await this.api.get<DeckResponse>(`Deck/GetDeckById?id=${id}`);
    return response;
  }

  // Obtener todos los decks de un usuario
  async GetAllUserDecks(userId: number): Promise<Result<DeckResponse[]>> {
    const response = await this.api.get<DeckResponse[]>(`Deck/GetAllUserDecks?userId=${userId}`);
    return response;
  }

  // Crear un deck
  async CreateDeck(deckData: DeckRequest): Promise<Result<DeckResponse>> {

    if (this.deckSize(deckData.DeckCards)) {
      const response = await this.api.post<DeckResponse>('Deck/CreateDeck', deckData);
      return response;

    } else {
      return {
        success: false,
        statusCode: 400,
        error: "Invalid deck size.",
        data: null,
        throwIfError: () => {
          throw new Error("Invalid deck size.");
        }
      };
    }
  }

  // Editar un deck
  async UpdateDeck(deckData: DeckRequest, deckId: number): Promise<Result<DeckResponse>> {

    if (this.deckSize(deckData.DeckCards)) {
      const response = await this.api.post<DeckResponse>(`Deck/UpdateDeck?id=${deckId}`, deckData, deckId);
      return response;

    } else {
      return {
        success: false,
        statusCode: 400,
        error: "Invalid deck size.",
        data: null,
        throwIfError: () => {
          throw new Error("Invalid deck size.");
        }
      };
    }
  }

  // Eliminar un deck
  async DeleteDeck(id: number): Promise<Result<DeckResponse>> {
    const response = await this.api.get<DeckResponse>(`Deck/DeleteDeck?id=${id}`);
    return response;
  }

  // Check deck size
  deckSize(deckCards: CardDetail[]): Boolean {
    if (/* deckCards.length >= 60 &&  */deckCards.length <= 150) {
      return true
    } else {
      return false
    }
  }

}