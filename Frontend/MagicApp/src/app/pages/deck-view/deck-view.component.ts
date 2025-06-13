import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DeckRequest } from 'src/app/models/deck-request';
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-deck-view',
  imports: [IonIcon, CommonModule, FormsModule, IonContent, SidebarComponent, TranslateModule, ReactiveFormsModule, FormsModule],
  templateUrl: './deck-view.component.html',
  styleUrls: ['./deck-view.component.css'],
  standalone: true,
})
export class DeckViewComponent implements OnInit, OnDestroy {
  error$: Subscription;
  deckId: number;
  deck: DeckResponse;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private route: ActivatedRoute,
    private alertController: AlertController,
    public deckCardsService: DeckCardsService,
    private webSocketService: WebsocketService,
    public translate: TranslateService
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

    this.deckId = Number(this.route.snapshot.queryParamMap.get('deckId'));

    if (!this.deckCardsService.deckId) {
      this.deck = (await this.deckService.GetDeckById(this.deckId)).data;

      this.deckCardsService.deckcards = this.deck.deckCards;
      this.deckCardsService.name = this.deck.name;
      this.deckCardsService.description = this.deck.description;
      this.deckCardsService.userId = this.deck.userId;
      this.deckCardsService.deckId = this.deck.id;
      this.deckCardsService.victories = this.deck.victories;
      this.deckCardsService.defeats = this.deck.defeats;
    }

    const navigation = history.state;
    if (navigation?.selectCard) {
      this.deckCardsService.addCard(navigation.selectCard);
    }
  }

  addCard() {
    this.navCtrl.navigateRoot("/add-cards-deck");
  }

  cardDetails() {
    this.navCtrl.navigateRoot("/deck-cards-views");
  }

  async updateDeck(form: NgForm) {
    if (form.invalid) {
      await this.presentAlert(
        this.translate.instant('DECK_VIEW.ERROR_REQUIRED'),
        this.translate.instant('DECK_VIEW.ERROR_NAME_LENGTH')
      );
      return;
    }

    const deckData: DeckRequest = {
      Name: this.deckCardsService.name,
      Description: this.deckCardsService.description,
      UserId: this.deckCardsService.userId,
      DeckCards: this.deckCardsService.deckCards,
      Victories: this.deckCardsService.victories,
      Defeats: this.deckCardsService.defeats
    };

    // Save the deck
    await this.deckService.UpdateDeck(deckData, this.deckCardsService.deckId);
    this.deckCardsService.clear();
    this.navCtrl.navigateRoot("/decks");
  }

  async deleteDeck() {
    await this.deckService.DeleteDeck(this.deckId);
    this.navCtrl.navigateRoot("/decks");
  }

  deckSize(): number {
    return this.deckCardsService.deckCards.length;
  }

  //VICTORIES
  incrementVictories() {
    this.deckCardsService.victories++;
  }

  decrementVictories() {
    this.deckCardsService.victories = Math.max(0, this.deckCardsService.victories - 1);
  }

  //DEFEATS
  incrementDefeats() {
    this.deckCardsService.defeats++;
  }

  decrementDefeats() {
    this.deckCardsService.defeats = Math.max(0, this.deckCardsService.defeats - 1);
  }

  getVictoryRate(): string {
    const victories = this.deckCardsService.victories || 0;
    const defeats = this.deckCardsService.defeats || 0;
    const totalGames = victories + defeats;

    if (totalGames === 0) {
      return '0%';
    }

    const rate = (victories / totalGames) * 100;
    return rate.toFixed(1) + '%';
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [this.translate.instant('COMMON.ACCEPT')]
    });

    await alert.present();
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}