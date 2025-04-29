import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CardDetail } from 'src/app/models/card-detail';
import { AuthService } from 'src/app/services/auth.service';
import { CardService } from 'src/app/services/card.service';
import { ModalService } from 'src/app/services/modal.service';
import { IonContent, IonButton } from "@ionic/angular/standalone";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-card-details',
  imports: [IonButton, IonContent, CommonModule],
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.css'],
  standalone: true,
})
export class CardDetailsComponent implements OnInit {

  cardId: string;
  card: CardDetail;
  safeOracleHtml: SafeHtml;

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private cardService: CardService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }

    this.cardId = this.route.snapshot.queryParamMap.get('cardId');

    if (this.cardId) {
      await this.loadCardDetails();
      console.log(this.card);

    } else {
      console.error("No se ha podido obtener el cardId");
      this.navCtrl.navigateRoot(['/menu']);
    }
  }

  // Obtiene los detalles de la carta
  private async loadCardDetails() {
    try {
      const result = await this.cardService.getCardById(this.cardId);

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

        this.navCtrl.navigateRoot(['/menu']);
      }

    } catch (error) {
      console.error("Error obteniendo la carta:", error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error obteniendo los datos de la carta',
        [{ text: 'Aceptar' }]
      );

      this.navCtrl.navigateRoot(['/menu']);
    }
  }

}