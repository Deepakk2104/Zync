import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAiYyUNNhiKw3Ucj5LDRZ6UpsxpoQi0axc",
  authDomain: "zync-e6279.firebaseapp.com",
  projectId: "zync-e6279",
  storageBucket: "zync-e6279.firebasestorage.app",
  messagingSenderId: "845184455051",
  appId: "1:845184455051:web:8405657647b91a391a9f8e",
  measurementId: "G-7HJ8ELFHGN",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export async function setUserOnlineStatus(userId, isOnline) {
  const ref = doc(db, "users", userId);

  await setDoc(
    ref,
    {
      online: isOnline,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

async function upsertUserProfile(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const payload = {
    uid: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    lastSeen: serverTimestamp(),
    online: true, // track online status
  };
  await setDoc(ref, payload, { merge: true });
}

async function createGroup(name, members) {
  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    members, // array of uids
    createdAt: serverTimestamp(),
  });
  return groupRef.id;
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  upsertUserProfile,
  createGroup,
};
