import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonToast,
  IonText,
  AlertController,
} from '@ionic/angular';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

// Firebase is initialized once per app; this guard prevents a
// "Firebase App named '[DEFAULT]' already exists" error if both
// tab1 and tab2 modules happen to load before the other finishes.
if (!getApps().length) {
  initializeApp(environment.firebaseConfig);
}
const db = getFirestore();

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonBadge,
    IonToast,
    IonText,
  ],
})
export class Tab2Page implements OnInit, OnDestroy {
  allBooks: Book[] = [];
  filteredBooks: Book[] = [];

  searchTerm = '';
  segmentFilter: 'all' | 'inStock' | 'outOfStock' = 'all';

  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' = 'success';

  private unsubscribe: (() => void) | null = null;

  constructor(private alertCtrl: AlertController) {}

  ngOnInit() {
    const booksRef = collection(db, 'books');
    this.unsubscribe = onSnapshot(
      booksRef,
      (snapshot) => {
        this.allBooks = snapshot.docs.map(
          (d) => ({ id: d.id, ...(d.data() as any) } as Book)
        );
        this.applyFilters();
      },
      (err) => {
        console.error(err);
        this.toastMessage = 'Failed to load books. Check Firestore rules.';
        this.showToast = true;
      }
    );
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  // Re-runs whenever data changes, the search box changes, or the
  // segment changes, so filteredBooks is always what the template shows.
  applyFilters() {
    let result = [...this.allBooks];

    if (this.segmentFilter === 'inStock') {
      result = result.filter((b) => b.quantity > 0);
    } else if (this.segmentFilter === 'outOfStock') {
      result = result.filter((b) => b.quantity === 0);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term) ||
          b.genre.toLowerCase().includes(term)
      );
    }

    this.filteredBooks = result;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value ?? '';
    this.applyFilters();
  }

  onSegmentChange(event: any) {
    this.segmentFilter = event.detail.value;
    this.applyFilters();
  }

  private typeAlertData(data: {
    title: string;
    author: string;
    genre: string;
    price: number | string;
    quantity: number | string;
  }) {
    return {
      title: data.title,
      author: data.author,
      genre: data.genre,
      price: Number(data.price) || 0,
      quantity: Number(data.quantity) || 0,
    };
  }

  // onSnapshot already keeps allBooks live-synced with Firestore, so
  // there's nothing new to fetch here — this just gives the pull-to-
  // refresh gesture something to do and closes it after a short delay.
  handleRefresh(event: any) {
    this.applyFilters();
    setTimeout(() => event.target.complete(), 500);
  }

  async updateBook(book: Book, slidingItem: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Update Book',
      inputs: [
        { name: 'title', type: 'text', value: book.title, placeholder: 'Title' },
        { name: 'author', type: 'text', value: book.author, placeholder: 'Author' },
        { name: 'genre', type: 'text', value: book.genre, placeholder: 'Genre' },
        { name: 'price', type: 'number', value: book.price, placeholder: 'Price' },
        { name: 'quantity', type: 'number', value: book.quantity, placeholder: 'Quantity' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data: {
            title: string;
            author: string;
            genre: string;
            price: number | string;
            quantity: number | string;
          }) => {
            const trimmedTitle = data.title?.trim();
            const trimmedAuthor = data.author?.trim();

            if (!trimmedTitle || !trimmedAuthor) {
              this.toastMessage = 'Title and author are required.';
              this.toastColor = 'danger';
              this.showToast = true;
              return false;
            }

            try {
              const payload = this.typeAlertData({
                title: trimmedTitle,
                author: trimmedAuthor,
                genre: data.genre?.trim() ?? '',
                price: data.price ?? 0,
                quantity: data.quantity ?? 0,
              });

              await updateDoc(doc(db, 'books', book.id), payload);
              this.toastMessage = 'Book updated.';
              this.toastColor = 'success';
              this.showToast = true;
              return true;
            } catch (err) {
              console.error(err);
              this.toastMessage = 'Update failed.';
              this.toastColor = 'danger';
              this.showToast = true;
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
    slidingItem.close();
  }

  async deleteBook(book: Book, slidingItem: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Book',
      message: `Are you sure you want to delete "${book.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteDoc(doc(db, 'books', book.id));
              this.toastMessage = 'Book deleted.';
              this.toastColor = 'success';
              this.showToast = true;
            } catch (err) {
              console.error(err);
              this.toastMessage = 'Delete failed.';
              this.toastColor = 'danger';
              this.showToast = true;
            }
          },
        },
      ],
    });

    await alert.present();
    slidingItem.close();
  }
}
