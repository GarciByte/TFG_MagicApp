import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { CardImage } from 'src/app/models/card-image';
import { AuthService } from 'src/app/services/auth.service';
import { CardService } from 'src/app/services/card.service';
import { IonContent, IonButton, IonSearchbar, IonSelectOption, IonCheckbox, IonSelect, IonIcon } from "@ionic/angular/standalone";
import { ModalService } from 'src/app/services/modal.service';
import { CardFilter } from 'src/app/models/card-filter';
import { Color } from 'src/app/models/enums/color';
import { Rarity } from 'src/app/models/enums/rarity';
import { CardType } from 'src/app/models/enums/card-type';
import { CardColorService } from 'src/app/services/card-color.service';
import { CardTypeService } from 'src/app/services/card-type.service';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-card-search',
  imports: [IonIcon, IonCheckbox, IonSearchbar, IonButton, IonContent, CommonModule, FormsModule, IonSelectOption, IonSelect, SidebarComponent],
  templateUrl: './card-search.component.html',
  styleUrls: ['./card-search.component.css'],
  standalone: true,
})
export class CardSearchComponent implements OnInit {

  searchTerm = ''; // Nombre de la carta
  cards: CardImage[] = []; // Lista de cartas
  hasSearched = false;
  isLoading = false;
  page: number = 1;
  rarity: Rarity | null = null;
  Rarity = Rarity;
  colors: Color[] = [];
  types: CardType[] = [];
  showAllFilters = false;
  debounceTimeout: any;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private cardService: CardService,
    private modalService: ModalService,
    private cardColorService: CardColorService,
    private cardTypeService: CardTypeService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.search()
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