import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-cards-deck',
  imports: [IonIcon, IonCheckbox, IonSearchbar, IonButton, IonContent, CommonModule, FormsModule, IonSelectOption, IonSelect, TranslateModule],
  templateUrl: './add-cards-deck.component.html',
  styleUrls: ['./add-cards-deck.component.css'],
  standalone: true,
})
export class AddCardsDeckComponent implements OnInit, OnDestroy {
  error$: Subscription;
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
    private sanitizer: DomSanitizer,
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

    this.search();
  }

  async selectCard(cardId: string) {
    await this.loadCardDetails(cardId);
    this.cardTransfer.setCard(this.card);
    this.search();
    this.navCtrl.back();
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
          this.translate.instant('MODALS.CARD_FETCH_ERROR.SINGLE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error obteniendo la carta:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('MODALS.CARD_FETCH_ERROR.DATA'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
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

    try {
      const cardFilter: CardFilter = {
        Page: this.page,
        Name: term,
        Colors: this.colors || null,
        Rarity: this.rarity,
        Types: this.types || null
      };

      const result = await this.cardService.searchCardImages(cardFilter);

      if (result.success && result.data) {
        this.cards = result.data;

      } else {
        console.error("Error obteniendo las cartas:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('MODALS.CARD_FETCH_ERROR.MULTIPLE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

        this.cards = [];
      }

    } catch (error) {
      console.error("Error obteniendo las cartas:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('MODALS.CARD_FETCH_ERROR.MULTIPLE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
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

  // CARD RARITY
  rarityOptions = [
    { label: this.translate.instant('FILTER.ALL'), value: null },
    { label: this.translate.instant('RARITY.COMMON'), value: Rarity.Common },
    { label: this.translate.instant('RARITY.UNCOMMON'), value: Rarity.Uncommon },
    { label: this.translate.instant('RARITY.RARE'), value: Rarity.Rare },
    { label: this.translate.instant('RARITY.MYTHIC'), value: Rarity.Mythic }
  ];

  // CARD COLOR
  cardColorOptions: ColorOption[] = [
    { label: this.translate.instant('COLOR.WHITE'), color: Color.W, checked: false },
    { label: this.translate.instant('COLOR.BLUE'), color: Color.U, checked: false },
    { label: this.translate.instant('COLOR.BLACK'), color: Color.B, checked: false },
    { label: this.translate.instant('COLOR.RED'), color: Color.R, checked: false },
    { label: this.translate.instant('COLOR.GREEN'), color: Color.G, checked: false }
  ];

  cardColor(option: ColorOption) {
    this.colors = this.cardColorService.cardColor(option.color, option.checked);
    this.realTimeSearch();
  }

  // CARD TYPE
  cardTypeOptions: TypeOption[] = [
    { label: 'CARD_TYPE.CREATURE', type: CardType.Creature, checked: false },
    { label: 'CARD_TYPE.INSTANT', type: CardType.Instant, checked: false },
    { label: 'CARD_TYPE.SORCERY', type: CardType.Sorcery, checked: false },
    { label: 'CARD_TYPE.ENCHANTMENT', type: CardType.Enchantment, checked: false },
    { label: 'CARD_TYPE.ARTIFACT', type: CardType.Artifact, checked: false },
    { label: 'CARD_TYPE.LAND', type: CardType.Land, checked: false },
    { label: 'CARD_TYPE.PLANESWALKER', type: CardType.Planeswalker, checked: false }
  ];

  cardType(option: TypeOption) {
    this.types = this.cardTypeService.cardType(option.type, option.checked);
    this.realTimeSearch();
  }

  // CAMBIAR DE PÁGINA
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

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}

// Helpers para selecionar los filtros
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