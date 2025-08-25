import React, { useState } from "react";
import { auth, provider } from "../firebase"; 
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Google Login
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      
      alert("Google Login Successful ✅");
    } catch (error) {
      console.error(error.message);
    }
  };

  // Email/Password Login
  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Email Login Successful ✅");
    } catch (error) {
      console.error(error.message);
    }
  };

  // Email/Password Signup
  const signupWithEmail = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup Successful ✅");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px", margin: "50px auto" }}>
      <h2>Zync Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={loginWithEmail}>Login with Email</button>
      <button onClick={signupWithEmail}>Signup with Email</button>
      <button onClick={signInWithGoogle}>Login with Google</button>
    </div>
  );
}
