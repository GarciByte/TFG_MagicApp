import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-signup',
  imports: [IonButton, IonInput, IonItem, IonCardContent, IonCard, IonContent,
    CommonModule, RouterModule, ReactiveFormsModule, IonSelect, IonSelectOption],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;

  avatars: string[] = [
    'Ajani',
    'Bolas',
    'Gideon',
    'Liliana',
    'Nissa',
    'Teferi'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navCtrl: NavController,
    private websocketService: WebsocketService,
    private modalService: ModalService
  ) {
    this.signupForm = this.fb.group({
      avatarName: [this.avatars[0], Validators.required],
      nickname: ['', [Validators.required, Validators.pattern(/^[^@]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
      { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated() && this.websocketService.isConnectedRxjs()) {
      this.navCtrl.navigateRoot('/menu');
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
    if (this.signupForm.invalid) {
      this.modalService.showAlert(
        'error',
        'Formulario no válido',
        [{ text: 'Aceptar' }]
      );
      return;
    }

    const formData = new FormData();
    formData.append('nickname', this.signupForm.get('nickname').value);
    formData.append('email', this.signupForm.get('email').value);
    formData.append('password', this.signupForm.get('password').value);
    formData.append('avatarName', this.signupForm.get('avatarName')?.value);

    const signupResult = await this.authService.signup(formData); // Registro
    console.log(signupResult);

    if (!signupResult.success) {
      this.modalService.showAlert(
        'error',
        'Error en el registro',
        [{ text: 'Aceptar' }]
      );
      return;
    }

    const authData = { nickname: this.signupForm.get('nickname').value, password: this.signupForm.get('password').value };
    const loginResult = await this.authService.login(authData, true); // Login
    console.log(loginResult);

    if (!loginResult.success) {
      this.modalService.showAlert(
        'error',
        'Error en el inicio de sesión',
        [{ text: 'Aceptar' }]
      );
      return;
    }

    if (this.websocketService.isConnectedRxjs()) {
      this.modalService.showToast("Te has registrado con éxito", "success");
      this.navCtrl.navigateRoot('/menu');

    } else {
      this.modalService.showAlert(
        'error',
        'Se ha producido un error en la conexión con el servidor',
        [{ text: 'Aceptar' }]
      );
    }
  }

}