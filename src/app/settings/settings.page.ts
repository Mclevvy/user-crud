import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { settings, moon, notifications, cloudUpload, informationCircle } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
  ],
})
export class SettingsPage {
  notificationsEnabled = true;
  darkMode = true;
  autoSync = true;

  constructor() {
    addIcons({
      settings,
      moon,
      notifications,
      'cloud-upload': cloudUpload,
      'information-circle': informationCircle,
    });
  }
}
