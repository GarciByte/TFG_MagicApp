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
import { CardService } from 'src/app/services/card.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-deck-cards-views',
  imports: [IonIcon, IonContent, CommonModule, FormsModule, SidebarComponent],
  templateUrl: './deck-cards-views.component.html',
  styleUrls: ['./deck-cards-views.component.css'],
  standalone: true,
})
export class DeckCardsViewsComponent implements OnInit {

  deckCards: CardDetail[] = [];
  card: CardDetail;
  safeOracleHtml: SafeHtml;


  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private router: Router,
    private alertController: AlertController,
    private deckCardsService: DeckCardsService,
    private cardService: CardService,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.deckCards = this.deckCardsService.deckCards;
    console.log(this.deckCards)
  }

  async removeCard(cardId: string) {
    await this.loadCardDetails(cardId)
    this.deckCardsService.remove(this.card)
    this.deckCards = this.deckCardsService.deckCards;
    console.log("hola")
    console.log(this.deckCards)
    this.navCtrl.back()
  }


  private async loadCardDetails(cardId: string) {
    try {
      const result = await this.cardService.getCardById(cardId);

      if (result.success && result.data) {
        this.card = result.data;

        this.safeOracleHtml = this.sanitizer.bypassSecurityTrustHtml(
          this.card.oracleTextHtml
        );

      } else {
        console.error("Error obteniendo la carta:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error obteniendo la carta',
          [{ text: 'Aceptar' }]
        );
      }

    } catch (error) {
      console.error("Error obteniendo la carta:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error obteniendo los datos de la carta',
        [{ text: 'Aceptar' }]
      );
    }
  }

  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }
}
