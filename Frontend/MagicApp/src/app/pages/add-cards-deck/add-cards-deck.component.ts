import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { card, arrowBackOutline, filterOutline, addCircleOutline } from 'ionicons/icons';
import { CardDetail } from 'src/app/models/card-detail';
import { CardService } from 'src/app/services/card.service';
import { ModalService } from 'src/app/services/modal.service';
import { IonButton, NavController, IonContent, IonSearchbar, IonIcon, IonSelectOption, IonSelect, IonCheckbox } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardImage } from 'src/app/models/card-image';
import { CardTransferService } from 'src/app/services/card-transfer.service';
import { CardFilter } from 'src/app/models/card-filter';
import { CardType } from 'src/app/models/enums/card-type';
import { Color } from 'src/app/models/enums/color';
import { Rarity } from 'src/app/models/enums/rarity';
import { AuthService } from 'src/app/services/auth.service';
import { CardColorService } from 'src/app/services/card-color.service';
import { CardTypeService } from 'src/app/services/card-type.service';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-add-cards-deck',
  imports: [IonIcon, IonCheckbox, IonSearchbar, IonButton, IonContent, CommonModule, FormsModule, IonSelectOption, IonSelect, SidebarComponent],
  templateUrl: './add-cards-deck.component.html',
  styleUrls: ['./add-cards-deck.component.css'],
  standalone: true,
})
export class AddCardsDeckComponent implements OnInit {

  safeOracleHtml: SafeHtml;

  hasSearched = false;
  searchTerm = ''; // Nombre de la carta
  debounceTimeout: any;
  isLoading = false;
  page: number = 1;


  cards: CardImage[] = []; // Lista de cartas
  card: CardDetail;

  showAllFilters = false;

  rarity: Rarity | null = null;
  Rarity = Rarity;
  colors: Color[] = [];
  types: CardType[] = [];

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private cardService: CardService,
    private modalService: ModalService,
    private cardColorService: CardColorService,
    private cardTypeService: CardTypeService,
    private cardTransfer: CardTransferService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.search()
  }

  async selectCard(cardId: string) {
    await this.loadCardDetails(cardId)
    this.cardTransfer.setCard(this.card)
    this.navCtrl.back()

    this.search()
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

  toggleFilters() {
    this.showAllFilters = !this.showAllFilters;
  }

  realTimeSearch() {
    clearTimeout(this.debounceTimeout);

    this.debounceTimeout = setTimeout(() => {
      this.search();
    }, 300); // Espera 3 segundos
  }

  // Buscar cartas por nombre
  async search() {
    const term = this.searchTerm.trim();
    this.hasSearched = true;
    this.isLoading = true;
    console.log(this.rarity)

    try {

      const cardFilter: CardFilter = {
        Page: this.page,
        Name: term,
        Colors: this.colors || null,
        Rarity: this.rarity,
        Types: this.types || null
      };

      console.log(cardFilter)

      const result = await this.cardService.searchCardImages(cardFilter);

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
      this.page = 1;
    }
  }

  // Redirigir a los detalles de la carta
  navigateToDetails(cardId: string) {
    this.navCtrl.navigateRoot(['/card-details'], {
      queryParams: { cardId }
    });
  }

  //CARD RARITY
  rarityOptions = [
    { label: 'Todas', value: null },
    { label: 'Común', value: Rarity.Common },
    { label: 'Poco Común', value: Rarity.Uncommon },
    { label: 'Rara', value: Rarity.Rare },
    { label: 'Mítica', value: Rarity.Mythic },
  ];


  //CARD COLOR
  cardColorOptions: ColorOption[] = [
    { label: 'Blanco', color: Color.W, checked: false },
    { label: 'Azul', color: Color.U, checked: false },
    { label: 'Negro', color: Color.B, checked: false },
    { label: 'Rojo', color: Color.R, checked: false },
    { label: 'Verde', color: Color.G, checked: false }
  ];

  cardColor(option: ColorOption) {
    this.colors = this.cardColorService.cardColor(option.color, option.checked);
    this.realTimeSearch();
  }

  //CARD TYPE
  cardTypeOptions: TypeOption[] = [
    { label: 'Creature', type: CardType.Creature, checked: false },
    { label: 'Instant', type: CardType.Instant, checked: false },
    { label: 'Sorcery', type: CardType.Sorcery, checked: false },
    { label: 'Enchantment', type: CardType.Enchantment, checked: false },
    { label: 'Artifact', type: CardType.Artifact, checked: false },
    { label: 'Land', type: CardType.Land, checked: false },
    { label: 'Planeswalker', type: CardType.Planeswalker, checked: false },
  ];

  cardType(option: TypeOption) {
    this.types = this.cardTypeService.cardType(option.type, option.checked);
    this.realTimeSearch();
  }

  //CAMBIAR DE PÁGINA
  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.search();
    }
  }

  nextPage() {
    this.page++;
    this.search();
  }

}

//Helpers para selecionar los filtros
type ColorOption = {
  label: string;
  color: Color;
  checked: boolean;
};

type TypeOption = {
  label: string;
  type: CardType;
  checked: boolean;
};