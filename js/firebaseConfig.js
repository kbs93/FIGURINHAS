import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

export const firebaseConfig = {
apiKey: "AIzaSyDprLN_SPBjx3ehjX8tsf75ldvoMDTPzv4",
  authDomain: "boxfiguras.firebaseapp.com",
  databaseURL: "https://boxfiguras-default-rtdb.firebaseio.com",
  projectId: "boxfiguras",
  storageBucket: "boxfiguras.firebasestorage.app",
  messagingSenderId: "912903668601",
  appId: "1:912903668601:web:a4134a15b5170fa7f525a8",
  measurementId: "G-RQ2GRWNYD9"
};

export const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);