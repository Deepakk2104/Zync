import { useState } from "react";
import { auth, provider, upsertUserProfile } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginWithEmail = async () => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await upsertUserProfile(user);
    alert("Email Login Successful");
  };

  const signInWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, provider);
    await upsertUserProfile(user);
    alert("Google Login Successful");
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
