import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-other-user-deck-view',
  imports: [IonIcon, CommonModule, FormsModule, IonContent],
  templateUrl: './other-user-deck-view.component.html',
  styleUrls: ['./other-user-deck-view.component.css'],
  standalone: true,
})
export class OtherUserDeckViewComponent implements OnInit, OnDestroy {
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
  }

  cardDetails() {
    console.log("View deck cards")
    this.navCtrl.navigateRoot("/deck-cards-views")
  }

  deckSize(): number {
    return this.deckCardsService.deckCards.length
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