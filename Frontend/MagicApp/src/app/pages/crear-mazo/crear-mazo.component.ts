import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NavController } from "@ionic/angular"
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
} from "@ionic/angular/standalone"

@Component({
  selector: "app-crear-mazo",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent
],
  templateUrl: "./crear-mazo.component.html",
  styleUrls: ["./crear-mazo.component.css"],
})
export class CrearMazoComponent implements OnInit {
  nombreMazo = ""
  formato = "Estándar"
  tamanio = 60

  formatos: string[] = ["Estándar", "Modern", "Commander", "Legacy", "Vintage", "Pauper"]
  tamanios: number[] = [40, 60, 100]

  constructor(public navCtrl: NavController) {}

  ngOnInit() {}

  anadirCartas() {
    console.log("Añadir cartas al mazo")
    // Implementar navegación a la página de añadir cartas
  }

  verCartas() {
    console.log("Ver cartas del mazo")
    // Implementar navegación a la página de ver cartas
  }

  crearMazo() {
    console.log("Crear mazo:", {
      nombre: this.nombreMazo,
      formato: this.formato,
      tamanio: this.tamanio,
    })

    // Aquí iría la lógica para guardar el mazo

    // Volver a la página de mazos
    this.navCtrl.navigateBack("/mazos")
  }
}
