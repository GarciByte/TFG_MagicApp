import { Injectable } from '@angular/core';
import { CardDetail } from '../models/card-detail';
import { DeckCardsService } from './deck-cards.service';

@Injectable({ providedIn: 'root' })
export class CardTransferService {

  constructor(private deckCardsService: DeckCardsService) { }

  setCard(card: CardDetail) {
    this.deckCardsService.addCard(card);
  }
}