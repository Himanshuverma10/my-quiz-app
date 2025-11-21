// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwYmRX1ouhNuZvjm3ivghXvnbQunw_R3w",
  authDomain: "genquiz-ai.firebaseapp.com",
  projectId: "genquiz-ai",
  storageBucket: "genquiz-ai.firebasestorage.app",
  messagingSenderId: "162025334990",
  appId: "1:162025334990:web:30a36e87a7600ac586c89f",
  measurementId: "G-3ML6QHXPCV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = firebase.auth();
const db = firebase.firestore();