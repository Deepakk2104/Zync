import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCXCwZH9Ro-9zETTYzPIJ2mJqB2Z7P6oh8Y",
  authDomain: "zync-web.firebaseapp.com",
  projectId: "zync-web",
  storageBucket: "zync-web.firebasestorage.app",
  messagingSenderId: "958939870606",
  appId: "1:958939870606:web:50b48c35ef6cf48fe7a0df"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);