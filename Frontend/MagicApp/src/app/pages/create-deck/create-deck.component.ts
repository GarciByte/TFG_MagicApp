import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NavController } from "@ionic/angular"
import { IonContent } from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"
import { CardDetail } from "../../models/card-detail";
import { DeckRequest } from '../../models/deck-request';
import { Router } from "@angular/router"

@Component({
  selector: "app-create-deck",
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: "./create-deck.component.html",
  styleUrls: ["./create-deck.component.css"],
})
export class CreateDeckComponent implements OnInit {
  deckId: number
  deckName = ""
  deckDescription = ""
  size = 60
  deckCards: CardDetail[] = []

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
    const navigation = history.state;
    if (navigation && navigation.selectCard) {
      this.deckCards.push(navigation.selectCard);
    }
  }

  addCard() {
    this.router.navigate(['/add-cards-deck']);
  }

  cardDetails() {
    console.log("View deck cards")
    // Navigation to the view cards page
  }

  async createDeck() {
    console.log("Create deck:", {
      name: this.deckName,
      size: this.size,
    })

    const deckData: DeckRequest = {
      Name: this.deckName,
      Description: this.deckDescription,
      UserId: 1,
      DeckCards: this.deckCards
    }


    // Save the deck
    const response = await this.deckService.CreateDeck(deckData)

    if (response.success) {
      // Navigate back to the decks page
      this.navCtrl.navigateBack("/decks")
    } else {
      //Error message
    }
  }

  async updateDeck() {
    // Logic for updating the deck
    const deckData: DeckRequest = {
      Name: this.deckName,
      Description: this.deckDescription,
      UserId: 1,
      DeckCards: this.deckCards
    }


    // Save the deck
    const response = await this.deckService.UpdateDeck(deckData)

    if (response.success) {
      // Navigate back to the decks page
      this.navCtrl.navigateBack("/decks")
    } else {
      //Error message
    }
  }

  async deleteDeck() {
    // Logic for deleting the deck
    const response = await this.deckService.DeleteDeck(this.deckId)

    if (response.success) {
      // Navigate back to the decks page
      this.navCtrl.navigateBack("/decks")
    } else {
      //Error message
    }
  }
}
