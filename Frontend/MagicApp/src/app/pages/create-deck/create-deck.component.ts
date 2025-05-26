import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NavController } from "@ionic/angular"
import { IonContent } from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"
import { CardDetail } from "../../models/card-detail";
import { DeckRequest } from '../../models/deck-request';

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
  format = "Standard"
  size = 60
  deckCards: CardDetail[] = []

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
    // Navigation to the add cards page
  }

  cardDetails() {
    console.log("View deck cards")
    // Navigation to the view cards page
  }

  async createDeck() {
    console.log("Create deck:", {
      name: this.deckName,
      format: this.format,
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

    if(response.success){
      // Navigate back to the decks page
      this.navCtrl.navigateBack("/decks")
    }else{
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

    if(response.success){
      // Navigate back to the decks page
      this.navCtrl.navigateBack("/decks")
    }else{
      //Error message
    }
  }

  async deleteDeck() {
    // Logic for deleting the deck
    const response = await this.deckService.DeleteDeck(this.deckId)

    if(response.success){
      // Navigate back to the decks page
      this.navCtrl.navigateBack("/decks")
    }else{
      //Error message
    }
  }
}
