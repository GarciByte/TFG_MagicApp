import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { DeckCard } from 'src/app/models/deck-card';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';

@Component({
  selector: 'app-deck-cards-views',
  templateUrl: './deck-cards-views.component.html',
  styleUrls: ['./deck-cards-views.component.css'],
  standalone: true,
})
export class DeckCardsViewsComponent implements OnInit {

  deckCards: DeckCard[] = [];

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private router: Router,
    private alertController: AlertController,
    private deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.deckCards = this.deckCardsService.deckCards;
  }

    navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }
}
