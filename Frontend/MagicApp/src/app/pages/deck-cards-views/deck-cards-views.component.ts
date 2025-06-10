import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { CardDetail } from 'src/app/models/card-detail';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { CardService } from 'src/app/services/card.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from 'src/app/services/modal.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';

@Component({
  selector: 'app-deck-cards-views',
  imports: [IonIcon, IonContent, CommonModule, FormsModule, SidebarComponent, TranslateModule],
  templateUrl: './deck-cards-views.component.html',
  styleUrls: ['./deck-cards-views.component.css'],
  standalone: true,
})
export class DeckCardsViewsComponent implements OnInit, OnDestroy {
  error$: Subscription;
  deckCards: CardDetail[] = [];
  card: CardDetail;
  safeOracleHtml: SafeHtml;


  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private webSocketService: WebsocketService,
    private deckService: DeckServiceService,
    private alertController: AlertController,
    private deckCardsService: DeckCardsService,
    private cardService: CardService,
    private sanitizer: DomSanitizer,
    private modalService: ModalService
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

    this.error$ = this.webSocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });

    this.deckCards = this.deckCardsService.deckCards;
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

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}