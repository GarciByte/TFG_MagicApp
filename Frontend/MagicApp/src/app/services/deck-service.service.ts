import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DeckRequest } from '../models/deck-request';
import { DeckResponse } from '../models/deck-response';
import { Result } from '../models/result';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class DeckServiceService {

  constructor(
    private api: ApiService
  ) { }

  //Obtener un deck a partir de un Id
  async GetDeckById(deckId: number): Promise<Result<DeckResponse>>{

    const response = await this.api.get<DeckResponse>('Deck/GetDeckById', deckId);
    console.log(response)

    return response;
  } 

  //Obtener todos los decks de un usuario
  async GetAllUserDecks(user: User): Promise<Result<DeckResponse>>{

    const response = await this.api.get<DeckResponse>('Deck/GetAllUserDecks', user);
    console.log(response)

    return response;
  } 

  //Crear un deck
  async CreateDeck(deckData: DeckRequest): Promise<Result<DeckResponse>>{

    const response = await this.api.post<DeckResponse>('Deck/CreateDeck', deckData);
    console.log(response)

    return response;
  } 

  //Editar un deck
  async UpdateDeck(deckData: DeckRequest): Promise<Result<DeckResponse>>{

    const response = await this.api.post<DeckResponse>('Deck/UpdateDeck', deckData);
    console.log(response)

    return response;
  } 

  //Eliminar un deck
  async DeleteDeck(deckId: number): Promise<Result<DeckResponse>>{

    const response = await this.api.get<DeckResponse>('Deck/DeleteDeck', deckId);
    console.log(response)

    return response;
  } 

}
