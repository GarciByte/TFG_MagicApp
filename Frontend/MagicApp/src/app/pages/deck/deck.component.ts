import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { NavController } from "@ionic/angular"
import { IonContent, IonIcon, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone"
import { Deck } from "src/app/models/deck"
import { AuthService } from "src/app/services/auth.service"

@Component({
  selector: "app-decks",
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol],
  templateUrl: "./deck.component.html",
  styleUrls: ["./deck.component.css"],
})
export class DeckComponent implements OnInit {
  decks: Deck[] = [
    {
      id: 1,
      name: "Deck 1",
      cards: 60,
      color: "#fff2b2",
      icon: "sun",
    },
    {
      id: 2,
      name: "Deck 2",
      cards: 60,
      color: "#ffbfaa",
      icon: "phoenix",
    },
    {
      id: 3,
      name: "Deck 3",
      cards: 60,
      color: "#fff2b2",
      icon: "sun",
    },
    {
      id: 4,
      name: "Deck 4",
      cards: 60,
      color: "#c8e6c9",
      icon: "tree",
    },
    {
      id: 5,
      name: "Deck 5",
      cards: 60,
      color: "#ffbfaa",
      icon: "phoenix",
    },
  ]

  constructor(
    public navCtrl: NavController,
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
  }

  createDeck() {
    this.navCtrl.navigateForward("/create-deck")
  }

  viewDeck(id: number) {
    console.log("View deck:", id)
    // Implement navigation to deck detail page
  }
}
