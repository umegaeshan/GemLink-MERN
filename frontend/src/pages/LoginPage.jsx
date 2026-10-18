import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to log in.");
        return;
      }

      if (!data.user || typeof data.token !== "string" || !data.token) {
        setError("Unexpected login response. Please try again.");
        return;
      }

      login(data);
      navigate("/", { replace: true });
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
    <main className="container auth-page">
      <Link className="back-link" to="/">
        ← Back to listings
      </Link>

      <section className="auth-card">
        <p className="eyebrow">WELCOME TO GEMLINK</p>
        <h1>Log in</h1>

        <form onSubmit={handleSubmit}>
          <label className="filter-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              maxLength={254}
              required
            />
          </label>

          <label className="filter-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="filter-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create account</Link>
        </p>

      </section>
    </main>
  </>
  );
}

export default LoginPage;