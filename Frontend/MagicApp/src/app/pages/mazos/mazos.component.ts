import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { NavController } from "@ionic/angular"
import { IonContent, IonIcon, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone"
import { Deck } from "src/app/models/deck"
import { AuthService } from "src/app/services/auth.service"

@Component({
  selector: "app-mazos",
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon, IonGrid, IonRow, IonCol],
  templateUrl: "./mazos.component.html",
  styleUrls: ["./mazos.component.css"],
})
export class MazosComponent implements OnInit {
  mazos: Deck[] = [
    {
      id: 1,
      nombre: "Mazo 1",
      cartas: 60,
      color: "#fff2b2",
      icono: "sun",
    },
    {
      id: 2,
      nombre: "Mazo 2",
      cartas: 60,
      color: "#ffbfaa",
      icono: "phoenix",
    },
    {
      id: 3,
      nombre: "Mazo 3",
      cartas: 60,
      color: "#fff2b2",
      icono: "sun",
    },
    {
      id: 4,
      nombre: "Mazo 4",
      cartas: 60,
      color: "#c8e6c9",
      icono: "tree",
    },
    {
      id: 5,
      nombre: "Mazo 5",
      cartas: 60,
      color: "#ffbfaa",
      icono: "phoenix",
    },
  ]

  constructor(
    public navCtrl: NavController,
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
  }

  crearMazo() {
    this.navCtrl.navigateForward("/crear-mazo")
  }

  verMazo(id: number) {
    console.log("Ver mazo:", id)
    // Implementar navegación al detalle del mazo
  }

}