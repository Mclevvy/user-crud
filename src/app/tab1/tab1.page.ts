import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonLoading,
  IonToast,
} from '@ionic/angular';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

// Initialize Firebase once when this module first loads.
if (!getApps().length) {
  initializeApp(environment.firebaseConfig);
}
const db = getFirestore();

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonLoading,
    IonToast,
  ],
})
export class Tab1Page {
  newBook = { title: '', author: '', genre: '', price: 0, quantity: 0 };

  isSaving = false;
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' = 'success';

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  async addBook() {
    if (!this.newBook.title.trim() || !this.newBook.author.trim()) {
      this.toastMessage = 'Title and author are required.';
      this.toastColor = 'danger';
      this.showToast = true;
      return;
    }

    this.isSaving = true;
    this.showToast = false;

    this.saveTimeout = setTimeout(() => {
      this.isSaving = false;
      this.toastMessage = 'Save timed out. Please check your network or Firestore rules.';
      this.toastColor = 'danger';
      this.showToast = true;
      this.saveTimeout = null;
    }, 10000);

    try {
      await addDoc(collection(db, 'books'), {
        title: this.newBook.title.trim(),
        author: this.newBook.author.trim(),
        genre: this.newBook.genre.trim(),
        price: Number(this.newBook.price) || 0,
        quantity: Number(this.newBook.quantity) || 0,
        createdAt: new Date().toISOString(),
      });

      this.toastMessage = 'Book added successfully!';
      this.toastColor = 'success';
      this.newBook = { title: '', author: '', genre: '', price: 0, quantity: 0 };
    } catch (err) {
      console.error(err);
      this.toastMessage =
        err instanceof Error ? err.message : 'Failed to add book. Check Firestore rules.';
      this.toastColor = 'danger';
    } finally {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      this.isSaving = false;
      this.showToast = true;
    }
  }
}
