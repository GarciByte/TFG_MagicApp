import { Injectable } from '@angular/core';
import { DeckCard } from '../models/deck-card';

@Injectable({ providedIn: 'root' })
export class DeckCardsService {
  private _deckId: number;//Deck Id
  private _deckCards: DeckCard[] = [];//Deck cards
  private _name: string;//Deck name
  private _description: string;//Deck description
  private _userId: number;//Deck user id


  clear() {
    this._deckCards = [];
    this._description = "";
    this._name = "";
    this._userId = null;
    this._deckId = null;
  }

  //DECK
  get deckCards(): DeckCard[] {
    return this._deckCards;
  }

  set deckcards(deckCards: DeckCard[]) {
    this._deckCards = deckCards
  }

  get deckId(): number{
    return this._deckId;
  }

  set deckId(deckId: number){
    this._deckId = deckId;
  }

  addCard(card: DeckCard) {
    this._deckCards.push(card);
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
