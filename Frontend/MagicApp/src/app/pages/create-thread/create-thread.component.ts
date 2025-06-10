import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { CreateForumThread } from 'src/app/models/create-forum-thread';
import { AuthService } from 'src/app/services/auth.service';
import { ForumService } from 'src/app/services/forum.service';
import { ModalService } from 'src/app/services/modal.service';
import { IonContent, IonIcon, IonItem, IonLabel, IonNote, IonButton, IonInput, IonTextarea, IonCard, IonCardHeader } from "@ionic/angular/standalone";
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-thread',
  imports: [IonCardHeader, IonCard, CommonModule, ReactiveFormsModule, IonContent, IonItem, IonLabel, IonInput,
    IonTextarea, IonButton, IonIcon, IonNote, TranslateModule],
  templateUrl: './create-thread.component.html',
  styleUrls: ['./create-thread.component.css'],
  standalone: true,
})
export class CreateThreadComponent implements OnInit, OnDestroy {

  error$: Subscription;
  threadForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public navCtrl: NavController,
    private authService: AuthService,
    private modalService: ModalService,
    private forumService: ForumService,
    private webSocketService: WebsocketService,
    public translate: TranslateService
  ) {
    this.threadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
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
  }

  // Crear un hilo
  async submitThread() {
    if (this.threadForm.invalid) {
      return;
    }
    this.isSubmitting = true;

    const createForumThread: CreateForumThread = {
      title: this.threadForm.value.title,
      content: this.threadForm.value.content
    };

    try {
      const result = await this.forumService.createThread(createForumThread);
      console.log(result);

      if (result.success) {

        this.modalService.showToast(
          this.translate.instant('CREATE_THREAD.TOAST_SUCCESS'),
          'success'
        );

        this.navCtrl.navigateRoot(['/thread-detail', result.data.id]);

      } else {
        console.error("Error al crear el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          this.translate.instant('CREATE_THREAD.ERROR_CREATING_THREAD'),
          [
            {
              text: this.translate.instant('COMMON.ACCEPT')
            }
          ]
        );

      }

    } catch (error) {
      console.error('Error al crear el hilo:', error);

      this.modalService.showAlert(
        'error',
        this.translate.instant('CREATE_THREAD.ERROR_CREATING_THREAD'),
        [
          {
            text: this.translate.instant('COMMON.ACCEPT')
          }
        ]
      );

    } finally {
      this.isSubmitting = false;
    }
  }

  ngOnDestroy(): void {
    if (this.error$) {
      this.error$.unsubscribe();
    }
  }

}