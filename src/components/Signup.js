import { useState } from "react";
import { auth, provider, upsertUserProfile } from "../firebase";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
  },
  leftPanel: {
    flexBasis: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "60px",
    color: "white",
    background:
      "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  chatBubble: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 0,
    clipPath:
      "polygon(0% 0%, 100% 0%, 100% 100%, 75% 100%, 50% 85%, 25% 100%, 0% 100%)",
    transform: "translate(-50%, -50%) rotate(45deg) scale(1.2)",
    opacity: 0.3,
  },
  rightPanel: {
    flexBasis: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "60px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "48px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    borderRadius: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    fontSize: "16px",
    color: "#4b5563",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1f2937",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginBottom: "16px",
  },
  googleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  linkText: {
    color: "#a855f7",
    fontSize: "14px",
    textDecoration: "none",
    fontWeight: "600",
  },
  passwordToggle: {
    position: "absolute",
    right: "15px",
    top: "40%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: "20px",
  },
};

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signupWithEmail = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await upsertUserProfile(user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message
        ? err.message
            .replace("Firebase: Error (auth/", "")
            .replace(").", "")
            .replace(/-/g, " ")
        : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      await upsertUserProfile(user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message
        ? err.message
            .replace("Firebase: Error (auth/", "")
            .replace(").", "")
            .replace(/-/g, " ")
        : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyles = (baseStyle) => ({
    ...baseStyle,
    opacity: loading ? 0.6 : 1,
    cursor: loading ? "not-allowed" : "pointer",
  });

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftPanel}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "white",
                marginRight: "10px",
              }}
            />
            <h1 style={{ fontSize: "24px", fontWeight: "700" }}>Zyncc</h1>
          </div>
          <p
            style={{
              fontSize: "32px",
              fontWeight: "600",
              lineHeight: "1.2",
              margin: "20px 0",
            }}
          >
            Join zyncc today and start collaborating with your friends
          </p>
        </div>

        <div style={styles.chatBubble}></div>

        <p
          style={{
            fontSize: "22px",
            fontWeight: "500",
            position: "relative",
            zIndex: 1,
          }}
        >
          Simplify your conversations.
        </p>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "30px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Create your account
          </h2>
          <p
            style={{ fontSize: "16px", marginBottom: "30px", color: "#6b7280" }}
          >
            Sign up to start using zyncc
          </p>

          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "4px",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "4px",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={styles.passwordToggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "14px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={signupWithEmail}
            disabled={loading}
            style={getButtonStyles(styles.primaryButton)}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div
            style={{ display: "flex", alignItems: "center", margin: "16px 0" }}
          >
            <div
              style={{ flexGrow: 1, height: "1px", backgroundColor: "#e5e7eb" }}
            />
            <span
              style={{
                margin: "0 10px",
                color: "#9ca3af",
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Or continue with
            </span>
            <div
              style={{ flexGrow: 1, height: "1px", backgroundColor: "#e5e7eb" }}
            />
          </div>

          <button
            onClick={signupWithGoogle}
            disabled={loading}
            style={getButtonStyles(styles.googleButton)}
          >
            <FcGoogle style={{ fontSize: "20px", marginRight: "8px" }} />
            Google
          </button>

          <p
            style={{
              marginTop: "30px",
              textAlign: "center",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={styles.linkText}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
