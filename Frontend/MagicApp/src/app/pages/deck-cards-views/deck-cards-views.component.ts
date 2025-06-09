import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CardDetail } from 'src/app/models/card-detail';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-deck-cards-views',
  templateUrl: './deck-cards-views.component.html',
  styleUrls: ['./deck-cards-views.component.css'],
  standalone: true,
})
export class DeckCardsViewsComponent implements OnInit, OnDestroy {
  error$: Subscription;
  deckCards: CardDetail[] = [];

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private alertController: AlertController,
    private deckCardsService: DeckCardsService,
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

    this.deckCards = this.deckCardsService.deckCards;
  }

  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }
  
}