import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { IonButton, IonCard, IonCardContent, IonInput, IonItem, IonSelect, IonSelectOption, IonCardHeader, IonCardTitle, IonContent, IonIcon } from "@ionic/angular/standalone";
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-user-profile',
  imports: [IonIcon, IonContent, IonCardTitle, IonCardHeader, IonButton, IonInput, IonItem, IonCardContent, IonCard,
    CommonModule, RouterModule, ReactiveFormsModule, IonSelect, IonSelectOption, SidebarComponent, TranslateModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
})
export class UserProfileComponent implements OnInit, OnDestroy {
  error$: Subscription;
  user: User = null;
  userProfileForm: FormGroup; // Modificar datos del usuario
  passwordForm: FormGroup; // Modificar contraseña

  avatars: string[] = [
    'Ajani',
    'Bolas',
    'Gideon',
    'Liliana',
    'Nissa',
    'Teferi'
  ];

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private userService: UserService,
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private webSocketService: WebsocketService,
    public translate: TranslateService
  ) {
    // Formulario para cambiar los datos del usuario
    this.userProfileForm = this.formBuilder.group({
      avatarName: [null, Validators.required],
      nickname: ['', [Validators.required, Validators.pattern(/^[^@]*$/)]], // No se permite el carácter @
      email: ['', [Validators.required, Validators.email]]
    });

    // Formulario para cambiar la contraseña del usuario
    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
      { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      return { mismatch: true };
    }

    return null;
  }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isAuthenticated())) {
      this.navCtrl.navigateRoot(['/']);
      return;
    }

    this.error$ = this.webSocketService.error.subscribe(async () => {
      await this.authService.logout();
      this.navCtrl.navigateRoot(['/']);
    });

    await this.loadUser();
  }

  async loadUser(): Promise<void> {
    this.user = await this.authService.getUser();

    // Rellenar el formulario con los datos del usuario
    this.userProfileForm.patchValue({
      avatarName: this.user.avatarUrl.replace(/^.*\/|\.jpg$/g, ''),
      nickname: this.user.nickname,
      email: this.user.email
    });
  }

  // Enviar formulario
  async onSubmitProfile(): Promise<void> {
    if (this.userProfileForm.invalid) {

      this.modalService.showAlert(
        'warning',
        this.translate.instant('USER_PROFILE.FILL_ALL_FIELDS'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

      return;
    }

    const formData = new FormData();
    formData.append('userId', this.user.userId.toString());
    formData.append('avatarName', this.userProfileForm.value.avatarName);
    formData.append('nickname', this.userProfileForm.value.nickname);
    formData.append('email', this.userProfileForm.value.email);

    try {
      const result = await this.userService.updateUserProfile(formData);

      if (result.success) {
        this.modalService.showToast(this.translate.instant('USER_PROFILE.SUCCESS_UPDATE'), 'success');
        await this.authService.updateUser(this.user.userId);
        await this.loadUser();

      } else {
        console.error("Error al actualizar los datos:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('USER_PROFILE.ERROR_UPDATE'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error al actualizar los datos:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('USER_PROFILE.ERROR_UPDATE'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Enviar formulario de la contraseña
  async onSubmitPassword(): Promise<void> {
    if (this.passwordForm.invalid) {

      this.modalService.showAlert(
        'warning',
        this.translate.instant('USER_PROFILE.FILL_PASSWORD'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

      return;
    }

    let newPassword = this.passwordForm.get('newPassword').value;

    try {
      const result = await this.userService.modifyPassword(newPassword);

      if (result.success) {

        await this.modalService.showAlert(
          'success',
          this.translate.instant('USER_PROFILE.SUCCESS_PASSWORD'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

        await this.authService.logout();
        this.navCtrl.navigateRoot(['/login']);

      } else {
        console.error("Error al actualizar la contraseña:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('USER_PROFILE.ERROR_PASSWORD'),
          [{ text: this.translate.instant('COMMON.ACCEPT') }]
        );

      }

    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('USER_PROFILE.ERROR_PASSWORD'),
        [{ text: this.translate.instant('COMMON.ACCEPT') }]
      );

    }
  }

  // Ver mazos del usuario
  viewDecks(): void {
    this.navCtrl.navigateRoot(['/decks']);
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}