import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { card } from 'ionicons/icons';
import { CardDetail } from 'src/app/models/card-detail';
import { CardService } from 'src/app/services/card.service';
import { ModalService } from 'src/app/services/modal.service';
import { IonButton, NavController, IonContent, IonSearchbar } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardImage } from 'src/app/models/card-image';

@Component({
  selector: 'app-add-cards-deck',
  imports: [IonSearchbar, IonButton, IonContent, CommonModule, FormsModule],
  templateUrl: './add-cards-deck.component.html',
  styleUrls: ['./add-cards-deck.component.css'],
  standalone: true,
})
export class AddCardsDeckComponent implements OnInit {

  constructor(
    public navCtrl: NavController,
    private cardService: CardService,
    private modalService: ModalService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() { }

  card: CardDetail;
  safeOracleHtml: SafeHtml;
  searchTerm = ''; // Nombre de la carta
  cards: CardImage[] = []; // Lista de cartas
  hasSearched = false;
  isLoading = false;

  selectCard(cardId: string) {
    this.router.navigate(['/pagina-principal'], {
      state: { selectedCard: this.card }
    });
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

  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }
}
