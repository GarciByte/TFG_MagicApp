import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { NavController } from "@ionic/angular"
import { IonContent, IonIcon, IonGrid, IonRow, IonCol} from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"
import { User } from "src/app/models/user"
import { DeckResponse } from "src/app/models/deck-response"
import { DeckCardsService } from "src/app/services/deck-cards.service"
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: "app-decks",
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol, SidebarComponent],
  templateUrl: "./deck.component.html",
  styleUrls: ["./deck.component.css"],
})
export class DeckComponent implements OnInit {
  decks: DeckResponse[] = []

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    public deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    } else {
      this.deckCardsService.clear()
      await this.getUserDecks();
    }
  }

  async getUserDecks() {
    const user = (await this.authService.getUser());
    const result = await this.deckService.GetAllUserDecks(user.userId);
    this.decks = result.data;
  }

  createDeck() {
    this.navCtrl.navigateRoot("/create-deck")
  }

  viewDeck(id: number) {
    console.log("View deck:", id)
    const deckId = "" + id;
    this.navCtrl.navigateRoot(['/deck-view'], {
      queryParams: { deckId }
    });
  }
}
