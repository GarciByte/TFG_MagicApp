import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { IonCol, IonContent, IonGrid, IonIcon, IonRow, NavController } from "@ionic/angular/standalone";
import { Subscription } from 'rxjs';
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-other-user-deck',
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol, TranslateModule],
  templateUrl: './other-user-deck.component.html',
  styleUrls: ['./other-user-deck.component.css'],
  standalone: true,
})
export class OtherUserDeckComponent implements OnInit, OnDestroy {
  error$: Subscription;
  decks: DeckResponse[] = []
  queryMap: ParamMap

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

    this.deckCardsService.clear();
    const userId = Number(this.route.snapshot.queryParamMap.get('id'));
    await this.getUserDecks(userId);
  }

  async getUserDecks(id: number) {
    const result = await this.deckService.GetAllUserDecks(id);
    this.decks = result.data;
  }

  viewDeck(id: number) {
    const deckId = "" + id;
    this.navCtrl.navigateRoot(['/other-user-deck-view'], {
      queryParams: { deckId }
    });
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}