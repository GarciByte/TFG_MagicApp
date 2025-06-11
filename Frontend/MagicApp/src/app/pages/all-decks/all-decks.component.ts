import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonCol, IonContent, IonGrid, IonIcon, IonRow, NavController, IonButton, IonSearchbar } from "@ionic/angular/standalone";
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component';
import { DeckResponse } from 'src/app/models/deck-response';
import { AuthService } from 'src/app/services/auth.service';
import { DeckCardsService } from 'src/app/services/deck-cards.service';
import { DeckServiceService } from 'src/app/services/deck-service.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-all-decks',
  imports: [FormsModule, IonSearchbar, IonButton, CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol, SidebarComponent],
  templateUrl: './all-decks.component.html',
  styleUrls: ['./all-decks.component.css'],
  standalone: true,
})
export class AllDecksComponent implements OnInit {

  decks: DeckResponse[] = []
  userNames: { [id: number]: string } = {};
  searchTerm = '';
  debounceTimeout: any;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private deckService: DeckServiceService,
    public deckCardsService: DeckCardsService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    } else {
      this.deckCardsService.clear()
      await this.getAllDecks();

      const userIds = [...new Set(this.decks.map(deck => deck.userId))];
      for (const id of userIds) {
        const user = await this.userService.getUserById(id);
        this.userNames[id] = user.data.nickname;
      }
    }
  }

  async getAllDecks() {
    const term = this.searchTerm.trim();
    const result = await this.deckService.GetAllDecks(term);
    this.decks = result.data;
  }

    realTimeSearch() {
    clearTimeout(this.debounceTimeout);

    this.debounceTimeout = setTimeout(() => {
      this.getAllDecks();
    }, 300); // Espera 3 segundos
  }

  viewDeck(id: number) {
    console.log("View deck:", id)
    const deckId = "" + id;
    this.navCtrl.navigateRoot(['/other-user-deck-view'], {
      queryParams: { deckId }
    });
  }

}
