import { Injectable } from '@angular/core';
import { DeckCard } from '../models/deck-card';

@Injectable({ providedIn: 'root' })
export class DeckCardsService {
  private _deckCards: DeckCard[] = [];//Deck cards
  private _name: string;//Deack name
  private _description: string;//Deack description

  //DECK
  get deckCards(): DeckCard[] {
    return this._deckCards;
  }

  set deckcards(deckCards: DeckCard[]){
    this._deckCards = deckCards
  }

  clear() {
    this._deckCards = [];
    this._description = "";
    this._name = "";
  }

  addCard(card: DeckCard) {
    this._deckCards.push(card);
  }

  //NAME
  get name(): string{
    return this._name;
  }

  set name(name: string){
    this._name = name
  }

  //DESCRIPTION
  get description(): string{
    return this._description
  }

  set description(description: string){
    this._description = description
  }

}
