import { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Google Login Successful ✅");
    } catch (error) {
      console.error(error.message);
    }
  };

  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Email Login Successful ✅");
    } catch (error) {
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
      <h2>Zync Login</h2>

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

      <button onClick={loginWithEmail}>Login with Email</button>
      <button onClick={signInWithGoogle}>Login with Google</button>
      <p>
        Don't have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
