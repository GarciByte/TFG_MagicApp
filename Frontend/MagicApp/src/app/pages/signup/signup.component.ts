import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-signup',
  imports: [IonContent, IonTitle, IonToolbar, IonHeader, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
})
export class SignupComponent implements OnInit {

  myForm: FormGroup;
  selectedFile: File;
  fileName: string = "Ningún archivo seleccionado";

  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private modalService: ModalService
  ) {
    this.myForm = this.formBuilder.group({
      avatar: [''],
      nickname: ['', [Validators.required, Validators.pattern(/^[^@]*$/)]], // No se permite el carácter @
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
      { validators: this.passwordMatchValidator });
  }

  async ngOnInit(): Promise<void> {
    if (await this.authService.isAuthenticated() && this.websocketService.isConnectedRxjs()) {
      this.navCtrl.navigateRoot(['/menu']);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = this.selectedFile.name;
      this.myForm.patchValue({ avatar: this.selectedFile });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPasswordControl = form.get('confirmPassword');
    const confirmPassword = confirmPasswordControl?.value;

    if (password !== confirmPassword && confirmPasswordControl) {
      confirmPasswordControl.setErrors({ mismatch: true });
    } else if (confirmPasswordControl) {
      confirmPasswordControl.setErrors(null);
    }
  }

  async submit() {
    if (this.myForm.valid) {
      const formData = new FormData();

      formData.append('nickname', this.myForm.get('nickname').value);
      formData.append('email', this.myForm.get('email').value);
      formData.append('password', this.myForm.get('password').value);
      formData.append('avatar', this.selectedFile);

      const signupResult = await this.authService.signup(formData); // Registro

      if (signupResult.success) {
        const authData = { nickname: this.myForm.get('nickname').value, password: this.myForm.get('password').value };
        const loginResult = await this.authService.login(authData, false); // Login

        if (loginResult.success) {
          this.modalService.showToast("Te has registrado con éxito", "success");

          if (this.websocketService.isConnectedRxjs()) {
            this.navCtrl.navigateRoot(['/menu']);

          } else {
            this.modalService.showAlert(
              'error',
              'Se ha producido un error en la conexión con el servidor',
              [{ text: 'Aceptar' }]
            );
          }

        } else {
          this.modalService.showAlert(
            'error',
            'Error en el inicio de sesión',
            [{ text: 'Aceptar' }]
          );
        }

      } else {
        this.modalService.showAlert(
          'error',
          'Error en el registro',
          [{ text: 'Aceptar' }]
        );
      }

    } else {
      this.modalService.showAlert(
        'error',
        'Formulario no válido',
        [{ text: 'Aceptar' }]
      );
    }

  }

}