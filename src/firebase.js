import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAiYyUNNhiKw3Ucj5LDRZ6UpsxpoQi0axc",
  authDomain: "zync-e6279.firebaseapp.com",
  projectId: "zync-e6279",
  storageBucket: "zync-e6279.firebasestorage.app",
  messagingSenderId: "845184455051",
  appId: "1:845184455051:web:8405657647b91a391a9f8e",
  measurementId: "G-7HJ8ELFHGN"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword };

