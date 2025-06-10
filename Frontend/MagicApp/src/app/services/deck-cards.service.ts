import { Injectable } from '@angular/core';
import { CardDetail } from '../models/card-detail';

@Injectable({ providedIn: 'root' })
export class DeckCardsService {
  private _deckId: number;//Deck Id
  private _deckCards: CardDetail[] = [];//Deck cards
  private _name: string;//Deck name
  private _description: string;//Deck description
  private _userId: number;//Deck user id
  private _victories: number;//Deck victories
  private _defeats: number;//Deck defeats


  clear() {
    this._deckCards = [];
    this._description = "";
    this._name = "";
    this._userId = null;
    this._deckId = null;
    this._victories = 0;
    this._defeats = 0;
  }

  //DECK CARDS
  get deckCards(): CardDetail[] {
    return this._deckCards;
  }

  set deckcards(deckCards: CardDetail[]) {
    this._deckCards = deckCards
  }

  addCard(card: CardDetail) {
    this._deckCards.push(card);
  }

remove(card: CardDetail) {
  const index = this._deckCards.findIndex(c => c.id === card.id);
  if (index !== -1) {
    this._deckCards.splice(index, 1);
  }
}



  //DECK ID
  get deckId(): number {
    return this._deckId;
  }

  set deckId(deckId: number) {
    this._deckId = deckId;
  }

  //VICTORIES
  get victories(): number {
    return this._victories;
  }

  set victories(victories: number) {
    this._victories = victories;
  }

  //DEFEATS
  get defeats(): number {
    return this._defeats;
  }

  set defeats(defeats: number) {
    this._defeats = defeats;
  }

  //NAME
  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name
  }

  //DESCRIPTION
  get description(): string {
    return this._description
  }

  set description(description: string) {
    this._description = description
  }

  //USER
  get userId(): number {
    return this._userId;
  }

  set userId(userId: number) {
    this._userId = userId;
  }

}
