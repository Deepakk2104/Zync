import { useState, useEffect } from "react";
import { auth, provider, upsertUserProfile } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return () => unsubscribe();
  }, [navigate]);

  const loginWithEmail = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await upsertUserProfile(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      await upsertUserProfile(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "350px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Zyncc</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: 327,
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#555",
            fontSize: "20px",
          }}
        >
          {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </button>
      </div>

      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

      <button
        onClick={loginWithEmail}
        disabled={loading}
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login with Email"}
      </button>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#DB4437",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login with Google"}
      </button>

      <p style={{ marginTop: "10px" }}>
        Don't have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
