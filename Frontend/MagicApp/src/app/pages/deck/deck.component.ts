import { Component, OnDestroy, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { NavController } from "@ionic/angular"
import { IonContent, IonIcon, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"
import { DeckResponse } from "src/app/models/deck-response"
import { Subscription } from "rxjs"
import { WebsocketService } from "src/app/services/websocket.service"
import { DeckCardsService } from "src/app/services/deck-cards.service"
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: "app-decks",
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol, TranslateModule, SidebarComponent],
  templateUrl: "./deck.component.html",
  styleUrls: ["./deck.component.css"],
})
export class DeckComponent implements OnInit, OnDestroy {
  error$: Subscription;
  decks: DeckResponse[] = []

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
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
    await this.getUserDecks();
  }

  async getUserDecks() {
    const user = (await this.authService.getUser());
    const result = await this.deckService.GetAllUserDecks(user.userId);
    this.decks = result.data;
  }

  createDeck() {
    this.navCtrl.navigateRoot("/create-deck");
  }

  viewDeck(id: number) {
    const deckId = "" + id;
    this.navCtrl.navigateRoot(['/deck-view'], {
      queryParams: { deckId }
    });
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }
}