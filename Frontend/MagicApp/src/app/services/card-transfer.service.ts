import { Injectable } from '@angular/core';
import { CardDetail } from '../models/card-detail';
import { NavController } from '@ionic/angular';
import { car } from 'ionicons/icons';
import { DeckCardsService } from './deck-cards.service';
import { DeckCard } from '../models/deck-card';

@Injectable({ providedIn: 'root' })
export class CardTransferService {

  constructor(
    private deckCardsService: DeckCardsService
  ) { }

  setCard(card: CardDetail) {
    const cardData: DeckCard = {
      CardId: card.id
    }
    this.deckCardsService.addCard(cardData)
  }
}
