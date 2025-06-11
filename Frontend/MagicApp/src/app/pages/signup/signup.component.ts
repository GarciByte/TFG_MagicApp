import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-signup',
  imports: [IonButton, IonInput, IonItem, IonCardContent, IonCard, IonContent,
    CommonModule, RouterModule, ReactiveFormsModule, IonSelect, IonSelectOption, TranslateModule],
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
    private modalService: ModalService,
    public translate: TranslateService
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

  async ngOnInit(): Promise<void> {
    if ((await this.authService.isAuthenticated()) && this.websocketService.isConnectedRxjs()) {
      this.navCtrl.navigateRoot(['/menu']);
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
        this.translate.instant('SIGNUP.ERROR_FORM'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );
      return;
    }

    const formData = new FormData();
    formData.append('nickname', this.signupForm.get('nickname').value);
    formData.append('email', this.signupForm.get('email').value);
    formData.append('password', this.signupForm.get('password').value);
    formData.append('avatarName', this.signupForm.get('avatarName')?.value);

    const signupResult = await this.authService.signup(formData); // Registro

    if (!signupResult.success) {
      this.modalService.showAlert(
        'error',
        this.translate.instant('SIGNUP.ERROR_SIGNUP'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );
      return;
    }

    const authData = { nickname: this.signupForm.get('nickname').value, password: this.signupForm.get('password').value };
    const loginResult = await this.authService.login(authData, true); // Login

    if (!loginResult.success) {
      this.modalService.showAlert(
        'error',
        this.translate.instant('SIGNUP.ERROR_LOGIN'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );
      return;
    }

    if (this.websocketService.isConnectedRxjs()) {
      this.modalService.showToast(
        this.translate.instant('SIGNUP.SUCCESS'),
        'success'
      );
      this.navCtrl.navigateRoot('/menu');

    } else {
      this.modalService.showAlert(
        'error',
        this.translate.instant('SIGNUP.ERROR_SERVER'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );
    }
  }

}