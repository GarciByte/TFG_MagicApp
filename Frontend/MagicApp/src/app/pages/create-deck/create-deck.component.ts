import { Component, OnDestroy, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, NgForm, ReactiveFormsModule } from "@angular/forms"
import { AlertController, NavController } from "@ionic/angular"
import { IonContent, IonIcon } from "@ionic/angular/standalone"
import { AuthService } from "src/app/services/auth.service"
import { DeckServiceService } from "src/app/services/deck-service.service"
import { DeckRequest } from '../../models/deck-request';
import { DeckCardsService } from "src/app/services/deck-cards.service"
import { CardDetail } from "src/app/models/card-detail"
import { Subscription } from "rxjs"
import { WebsocketService } from "src/app/services/websocket.service"
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: "app-create-deck",
  standalone: true,
  imports: [IonIcon, CommonModule, FormsModule, IonContent, TranslateModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: "./create-deck.component.html",
  styleUrls: ["./create-deck.component.css"],
})
export class CreateDeckComponent implements OnInit, OnDestroy {
  error$: Subscription;
  deckId: number;
  deckName = "";
  deckDescription = "";
  size = 60;
  deckCards: CardDetail[] = [];

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckService: DeckServiceService,
    private webSocketService: WebsocketService,
    private alertController: AlertController,
    private deckCardsService: DeckCardsService,
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

    this.deckCards = this.deckCardsService.deckCards;
    this.deckName = this.deckCardsService.name;
    this.deckDescription = this.deckCardsService.description;
  }

  addCard() {
    this.navCtrl.navigateRoot("/add-cards-deck");
  }

  cardDetails() {
    this.navCtrl.navigateRoot("/deck-cards-views");
    console.log("View deck cards")
    this.navCtrl.navigateRoot("/deck-cards-views")
  }

  async createDeck(form: NgForm) {
    if (form.invalid) {
      await this.presentAlert(
        this.translate.instant('DECK.ERROR_HEADER'),
        this.translate.instant('DECK.ERROR_NAME_LENGTH')
      );
      return;
    }

    this.deckCardsService.name = this.deckName;
    this.deckCardsService.description = this.deckDescription;

    const deckData: DeckRequest = {
      Name: this.deckName,
      Description: this.deckDescription,
      UserId: (await this.authService.getUser()).userId,
      DeckCards: this.deckCards,
      Victories: 0,
      Defeats: 0
    };

    // Guardar deck
    const response = await this.deckService.CreateDeck(deckData);
    if (response.success) {
      this.deckCardsService.clear();
      this.navCtrl.navigateRoot(['/decks']);
      
    } else {
      await this.presentAlert(
        this.translate.instant('DECK.ERROR_HEADER'),
        this.translate.instant('DECK.ERROR_SIZE')
      );
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [ this.translate.instant('COMMON.ACCEPT') ]
    });

    await alert.present();
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}