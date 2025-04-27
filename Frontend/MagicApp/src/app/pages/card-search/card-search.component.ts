import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { CardImage } from 'src/app/models/card-image';
import { AuthService } from 'src/app/services/auth.service';
import { CardService } from 'src/app/services/card.service';
import { IonContent, IonButton, IonSearchbar } from "@ionic/angular/standalone";
import { ModalService } from 'src/app/services/modal.service';

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
  }

  // Buscar cartas por nombre
  async search() {
    const term = this.searchTerm.trim();
    this.hasSearched = true;
    this.isLoading = true;

    if (!term) {
      this.cards = [];
      this.isLoading = false;
      return;
    }

    try {
      const result = await this.cardService.searchCardImages(term);

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

}