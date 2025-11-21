// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwYmRX1ouhNuZvjm3ivghXvnbQunw_R3w",
  authDomain: "genquiz-ai.firebaseapp.com",
  projectId: "genquiz-ai",
  storageBucket: "genquiz-ai.firebasestorage.app",
  messagingSenderId: "162025334990",
  appId: "1:162025334990:web:30a36e87a7600ac586c89f",
  measurementId: "G-3ML6QHXPCV"
};


// ⚠️ Yahan koi 'import' line nahi honi chahiye!
// Hum index.html wali CDN scripts use kar rahe hain.

// 1. Initialize Firebase (Old "Compat" Style for CDN)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. Global Variables Set Karo (Taaki app.js inhe access kar sake)
// Yeh line sabse important hai 'auth is not defined' error hatane ke liye
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log("Firebase Connected Successfully ✅");