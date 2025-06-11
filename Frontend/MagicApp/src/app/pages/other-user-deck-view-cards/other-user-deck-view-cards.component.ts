import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { IonContent, IonIcon, NavController } from "@ionic/angular/standalone";
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component';
import { CardDetail } from 'src/app/models/card-detail';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-other-user-deck-view-cards',
  imports: [IonIcon, IonContent, CommonModule, FormsModule, SidebarComponent, TranslateModule],
  templateUrl: './other-user-deck-view-cards.component.html',
  styleUrls: ['./other-user-deck-view-cards.component.css'],
  standalone: true,
})
export class OtherUserDeckViewCardsComponent implements OnInit {
  deckCards: CardDetail[] = [];
  card: CardDetail;
  safeOracleHtml: SafeHtml;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isAuthenticated())) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    this.deckCards = this.deckCardsService.deckCards;
  }

  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }

}