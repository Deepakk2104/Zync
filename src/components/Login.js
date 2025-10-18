import { useState } from "react";
import { auth, provider, upsertUserProfile } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginWithEmail = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await upsertUserProfile(user);
      alert("Email Login Successful");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, provider);
      await upsertUserProfile(user);
      alert("Google Login Successful");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
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
      <h2>Zyncc</h2>

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
        Don&apos;t have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
