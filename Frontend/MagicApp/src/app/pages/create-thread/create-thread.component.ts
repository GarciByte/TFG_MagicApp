import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { CreateForumThread } from 'src/app/models/create-forum-thread';
import { AuthService } from 'src/app/services/auth.service';
import { ForumService } from 'src/app/services/forum.service';
import { ModalService } from 'src/app/services/modal.service';
import { IonContent, IonIcon, IonItem, IonLabel, IonNote, IonButton, IonInput, IonTextarea, IonCard, IonCardHeader } from "@ionic/angular/standalone";

@Component({
  selector: 'app-create-thread',
  imports: [IonCardHeader, IonCard, CommonModule, ReactiveFormsModule, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonIcon, IonNote],
  templateUrl: './create-thread.component.html',
  styleUrls: ['./create-thread.component.css'],
  standalone: true,
})
export class CreateThreadComponent implements OnInit {

  threadForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public navCtrl: NavController,
    private authService: AuthService,
    private modalService: ModalService,
    private forumService: ForumService
  ) {
    this.threadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  async ngOnInit(): Promise<void> {
    if (!await this.authService.isAuthenticated()) {
      this.navCtrl.navigateRoot(['/']);
    }
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
        this.modalService.showToast('Hilo creado con éxito', "success");
        this.navCtrl.navigateRoot(['/thread-detail', result.data.id]);

      } else {
        console.error("Error al crear el hilo:", result.error);

        this.modalService.showAlert(
          'error',
          'Se ha producido un error al crear el hilo',
          [{ text: 'Aceptar' }]
        );

      }

    } catch (error) {
      console.error('Error al crear el hilo:', error);

      this.modalService.showAlert(
        'error',
        'Se ha producido un error al crear el hilo',
        [{ text: 'Aceptar' }]
      );

    } finally {
      this.isSubmitting = false;
    }
  }

}