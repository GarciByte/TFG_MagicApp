import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AlertController, NavController } from "@ionic/angular"
import { IonContent, IonIcon } from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"
import { DeckRequest } from '../../models/deck-request';
import { Router } from "@angular/router"
import { DeckCardsService } from "src/app/services/deck-cards.service"
import { CardDetail } from "src/app/models/card-detail"

@Component({
  selector: "app-create-deck",
  standalone: true,
  imports: [IonIcon, CommonModule, FormsModule, IonContent],
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
    private router: Router,
    private alertController: AlertController,
    private deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.deckCards = this.deckCardsService.deckCards;
    this.deckName = this.deckCardsService.name;
    this.deckDescription = this.deckCardsService.description;
  }

  setDeckName(name: string){
    this.deckCardsService.name = this.deckName
  }

  setDeckDescription(description: string){
    this.deckCardsService.description = this.deckDescription
  }

  addCard() {
   this.navCtrl.navigateRoot("/add-cards-deck")
  }

  cardDetails() {
    console.log(this.deckCards)
    // Navigation to the view cards page
  }

  async createDeck() {

    const deckData: DeckRequest = {
      Name: this.deckName,
      Description: this.deckDescription,
      UserId: (await this.authService.getUser()).userId,
      DeckCards: this.deckCards,
      Victories: 0,
      Defeats: 0
    }

    console.log("Create deck:", {
      Name: deckData.Name,
      Description: deckData.Description,
      UserId: deckData.UserId,
      DeckCards: deckData.DeckCards.length
    })

    // Save the deck
    const response = await this.deckService.CreateDeck(deckData)
    if (response.success) {
      console.log(response.data)
      this.deckCardsService.clear();

      // Navigate back to the decks page
      this.navCtrl.navigateRoot(['/decks']);
    } else {
      //Error message
      console.log("Esto no furula")
      await this.presentAlert('Error', 'Tamaño del mazo inadecuado')
    }
  }

  async presentAlert(header: string, message: string) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons: ['OK']
  });

  await alert.present();
}

}
