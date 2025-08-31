import { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup with email
  const signupWithEmail = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup Successful ✅");
      setEmail("");
      setPassword("");
    } catch (error) {
      alert(error.message);
      console.error(error.message);
    }
  };

  // signup with Google
  const signupWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Google Signup Successful ✅");
    } catch (error) {
      alert(error.message);
      console.error(error.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "300px",
        margin: "50px auto",
      }}
    >
      <h2>Zync Signup</h2>

      <input
        name="email"
        id="email"
        type="email"
        autoComplete="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        name="password"
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={signupWithEmail}>Signup with Email</button>
      <button onClick={signupWithGoogle}>Signup with Google</button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
