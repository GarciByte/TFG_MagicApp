import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { IonCol, IonContent, IonGrid, IonIcon, IonRow, NavController } from "@ionic/angular/standalone";
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';

@Component({
  selector: 'app-other-user-deck',
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol],
  templateUrl: './other-user-deck.component.html',
  styleUrls: ['./other-user-deck.component.css'],
  standalone: true,
})
export class OtherUserDeckComponent implements OnInit {
  decks: DeckResponse[] = []
  queryMap: ParamMap

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private route: ActivatedRoute,
    public deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    } else {
      this.deckCardsService.clear()
      const userId = Number(this.route.snapshot.queryParamMap.get('id'));
      console.log(userId)
      await this.getUserDecks(userId);
    }
  }

  async getUserDecks(id: number) {
    const result = await this.deckService.GetAllUserDecks(id);
    console.log(result)
    this.decks = result.data;
  }

  viewDeck(id: number) {
    console.log("View deck:", id)
    const deckId = "" + id;
    this.navCtrl.navigateRoot(['/other-user-deck-view'], {
      queryParams: { deckId }
    });
  }

}
