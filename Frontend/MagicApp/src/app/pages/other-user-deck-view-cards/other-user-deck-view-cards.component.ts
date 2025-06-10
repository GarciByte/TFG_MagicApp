import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonIcon, NavController } from "@ionic/angular/standalone";
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component';
import { CardDetail } from 'src/app/models/card-detail';
import { AuthService } from 'src/app/services/auth.service';
import { CardService } from 'src/app/services/card.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-other-user-deck-view-cards',
   imports: [IonIcon, IonContent, CommonModule, FormsModule, SidebarComponent],
  templateUrl: './other-user-deck-view-cards.component.html',
  styleUrls: ['./other-user-deck-view-cards.component.css'],
  standalone: true,
})
export class OtherUserDeckViewCardsComponent  implements OnInit {

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

  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }

}
