import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { CardDetail } from 'src/app/models/card-detail';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { IonButton, IonCheckbox, IonContent, IonIcon, IonSearchbar, IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-deck-cards-views',
  imports: [IonIcon, IonCheckbox, IonSearchbar, IonButton, IonContent, CommonModule, FormsModule, IonSelectOption, IonSelect, SidebarComponent],
  templateUrl: './deck-cards-views.component.html',
  styleUrls: ['./deck-cards-views.component.css'],
  standalone: true,
})
export class DeckCardsViewsComponent implements OnInit {

  deckCards: CardDetail[] = [];

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
    console.log(this.deckCards)
  }

  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }
}
