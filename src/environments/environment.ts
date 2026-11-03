// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: 'AIzaSyDqk82VoIDkiHF4I8luhUobCMXJposzfPs',
  authDomain: 'montoyaact4.firebaseapp.com',
  projectId: 'montoyaact4',
  storageBucket: 'montoyaact4.firebasestorage.app',
  messagingSenderId: '699358459215',
  appId: '1:699358459215:web:ca3b82de0a832e6624813a',
  measurementId: 'G-PP6BW028ZQ',
};

export const environment = {
  production: false,
  firebaseConfig,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);