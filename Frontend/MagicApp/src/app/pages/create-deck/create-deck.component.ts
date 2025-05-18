import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NavController } from "@ionic/angular"
import { IonContent } from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"

@Component({
  selector: "app-create-deck",
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: "./create-deck.component.html",
  styleUrls: ["./create-deck.component.css"],
})
export class CreateDeckComponent implements OnInit {
  deckName = ""
  format = "Standard"
  size = 60

  formats: string[] = ["Standard", "Modern", "Commander", "Legacy", "Vintage", "Pauper"]
  sizes: number[] = [40, 60, 100]

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
  }

  addCard() {
    console.log("Add cards to the deck")
    // Implement navigation to the add cards page
  }

  cardDetails() {
    console.log("View deck cards")
    // Implement navigation to the view cards page
  }

  createDeck() {
    console.log("Create deck:", {
      name: this.deckName,
      format: this.format,
      size: this.size,
    })

    // Logic to save the deck would go here

    // Navigate back to the decks page
    this.navCtrl.navigateBack("/decks")
  }

  updateDeck() {
    // Logic for updating the deck
  }

  deleteDeck() {
    // Logic for deleting the deck
  }
}
