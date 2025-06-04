import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { CardImage } from 'src/app/models/card-image';
import { AuthService } from 'src/app/services/auth.service';
import { CardService } from 'src/app/services/card.service';
import { IonContent, IonButton, IonSearchbar } from "@ionic/angular/standalone";
import { ModalService } from 'src/app/services/modal.service';
import { CardFilter } from 'src/app/models/card-filter';
import { Color } from 'src/app/models/enums/color';
import { Rarity } from 'src/app/models/enums/rarity';
import { CardType } from 'src/app/models/enums/card-type';

@Component({
  selector: 'app-card-search',
  imports: [IonSearchbar, IonButton, IonContent, CommonModule, FormsModule],
  templateUrl: './card-search.component.html',
  styleUrls: ['./card-search.component.css'],
  standalone: true,
})
export class CardSearchComponent implements OnInit {

  searchTerm = ''; // Nombre de la carta
  cards: CardImage[] = []; // Lista de cartas
  hasSearched = false;
  isLoading = false;
  page: number;
  colors: Color[];
  rarity: Rarity;
  types: CardType[];

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private cardService: CardService,
    private modalService: ModalService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.search()
  }

  // Buscar cartas por nombre
  async search() {
    const term = this.searchTerm.trim();
    this.hasSearched = true;
    this.isLoading = true;

    try {

      const cardFilter: CardFilter = {
        Page: 0,
        Name: term,
        Colors: null,
        Rarity: null,
        Types: null
      }

      console.log(cardFilter)

      const result = await this.cardService.searchCardImages(cardFilter);
      console.log(result.data)

      if (result.success && result.data) {
        this.cards = result.data;

      } else {
        console.error("Error obteniendo las cartas:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error obteniendo las cartas',
          [{ text: 'Aceptar' }]
        );

        this.cards = [];
      }

    } catch (error) {
      console.error("Error obteniendo las cartas:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error obteniendo las cartas',
        [{ text: 'Aceptar' }]
      );

      this.cards = [];

    } finally {
      this.isLoading = false;
    }
  }

  // Redirigir a los detalles de la carta
  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }

}