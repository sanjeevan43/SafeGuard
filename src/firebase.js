import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBqjGOHd2NG8rIDxI_2HziKv9KfSdTBqlc",
  authDomain: "safeguard-93c61.firebaseapp.com",
  databaseURL: "https://safeguard-93c61-default-rtdb.firebaseio.com",
  projectId: "safeguard-93c61",
  storageBucket: "safeguard-93c61.firebasestorage.app",
  messagingSenderId: "39142244891",
  appId: "1:39142244891:web:074be3d51f6aa30112eebe",
  measurementId: "G-FGN13WHJ74"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);