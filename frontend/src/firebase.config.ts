import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: 'AIzaSyAcwtSryk3XfnoabYNO5uIcjbXIaWkoPjI',
  authDomain: 'cryptophunks-auction-house.firebaseapp.com',
  projectId: 'cryptophunks-auction-house',
  storageBucket: 'cryptophunks-auction-house.appspot.com',
  messagingSenderId: '356196458803',
  appId: '1:356196458803:web:9d9de545fd5c3db0a29e46',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
