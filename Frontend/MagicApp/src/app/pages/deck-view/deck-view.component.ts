import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DeckRequest } from 'src/app/models/deck-request';
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { IonContent } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeckCard } from 'src/app/models/deck-card';
import { DeckCardsService } from 'src/app/services/deck-cards.service';

@Component({
  selector: 'app-deck-view',
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: './deck-view.component.html',
  styleUrls: ['./deck-view.component.css'],
  standalone: true,
})
export class DeckViewComponent implements OnInit {
  deckId: number
  deckName = ""
  deckDescription = ""
  size = 60
  deckCards: DeckCard[] = []

  deck: DeckResponse;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private router: Router,
    private route: ActivatedRoute,
    public deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    this.deckId = Number(this.route.snapshot.queryParamMap.get('deckId'));

    if (this.deckCardsService.deckCards.length === 0) {
      this.deck = (await this.deckService.GetDeckById(this.deckId)).data;

      this.deckCardsService.deckcards = this.deck.deckCards;
      this.deckCardsService.name = this.deck.name;
      this.deckCardsService.description = this.deck.description;
      this.deckCardsService.userId = this.deck.userId;
      this.deckCardsService.deckId = this.deck.id;

      console.log("Deck cargado desde backend:", this.deck);
    } else {
      console.log("Deck cargado desde el servicio (memoria)");
    }

    this.deckName = this.deckCardsService.name;
    this.deckDescription = this.deckCardsService.description;
    this.deckCards = this.deckCardsService.deckCards;

    const navigation = history.state;
    if (navigation?.selectCard) {
      this.deckCardsService.addCard(navigation.selectCard);
      this.deckCards = this.deckCardsService.deckCards;
    }
  }


  addCard() {
    this.navCtrl.navigateRoot("/add-cards-deck")
  }

  cardDetails() {
    console.log("View deck cards")
    this.navCtrl.navigateRoot("/deck-cards-views")
  }

  async updateDeck() {
    const deckData: DeckRequest = {
      Name: this.deckCardsService.name,
      Description: this.deckCardsService.description,
      UserId: this.deckCardsService.userId,
      DeckCards: this.deckCardsService.deckCards
    }

    // Save the deck
    const response = await this.deckService.UpdateDeck(deckData, this.deckCardsService.deckId)
    this.deckCardsService.clear()
    this.navCtrl.navigateRoot("/decks")

  }

  async deleteDeck() {
    const response = await this.deckService.DeleteDeck(this.deckId)
    this.navCtrl.navigateRoot("/decks")
  }

}
