import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DeckRequest } from 'src/app/models/deck-request';
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-deck-view',
  imports: [IonIcon, CommonModule, FormsModule, IonContent],
  templateUrl: './deck-view.component.html',
  styleUrls: ['./deck-view.component.css'],
  standalone: true,
})
export class DeckViewComponent implements OnInit, OnDestroy {
  error$: Subscription;
  deckId: number;
  deck: DeckResponse;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private route: ActivatedRoute,
    public deckCardsService: DeckCardsService,
    private webSocketService: WebsocketService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isAuthenticated())) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    this.error$ = this.webSocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });

    this.deckId = Number(this.route.snapshot.queryParamMap.get('deckId'));

    if (this.deckCardsService.deckCards.length === 0) {
      this.deck = (await this.deckService.GetDeckById(this.deckId)).data;

      this.deckCardsService.deckcards = this.deck.deckCards;
      this.deckCardsService.name = this.deck.name;
      this.deckCardsService.description = this.deck.description;
      this.deckCardsService.userId = this.deck.userId;
      this.deckCardsService.deckId = this.deck.id;
      this.deckCardsService.victories = this.deck.victories;
      this.deckCardsService.defeats = this.deck.defeats;
    }

    const navigation = history.state;
    if (navigation?.selectCard) {
      this.deckCardsService.addCard(navigation.selectCard);
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
      DeckCards: this.deckCardsService.deckCards,
      Victories: this.deckCardsService.victories,
      Defeats: this.deckCardsService.defeats
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

  deckSize(): number {
    return this.deckCardsService.deckCards.length
  }

  incrementVictories() {
    this.deckCardsService.victories++;
  }

  decrementVictories() {
    this.deckCardsService.victories = Math.max(0, this.deckCardsService.victories - 1);
  }

  incrementDefeats() {
    this.deckCardsService.defeats++;
  }

  decrementDefeats() {
    this.deckCardsService.defeats = Math.max(0, this.deckCardsService.defeats - 1);
  }

  getVictoryRate(): string {
    const victories = this.deckCardsService.victories || 0;
    const defeats = this.deckCardsService.defeats || 0;
    const totalGames = victories + defeats;

    if (totalGames === 0) {
      return '0%';
    }

    const rate = (victories / totalGames) * 100;
    return rate.toFixed(1) + '%';
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}