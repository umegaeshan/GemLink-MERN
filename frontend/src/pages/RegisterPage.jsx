import { useState } from "react";
import { Link } from "react-router";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("buyer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (password.length < 15) {
      setError("Password must contain at least 15 characters.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("Password is too long. Use no more than 72 UTF-8 bytes.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create account.");
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container auth-page">
      <Link className="back-link" to="/">
        ← Back to listings
      </Link>

      <section className="auth-card">
        <p className="eyebrow">JOIN GEMLINK</p>
        <h1>Create an account</h1>

        {success ? (
          <div role="status">
            <p>Your account was created successfully.</p>

            <Link className="details-link" to="/login">
              Go to login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <label className="filter-field">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>

              <label className="filter-field">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>

              <label className="filter-field">
                Account type
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="buyer">
                    Buyer — browse and send inquiries
                  </option>

                  <option value="seller">
                    Seller — create and manage listings
                  </option>
                </select>
              </label>

              <label className="filter-field">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={15}
                  aria-describedby="password-help"
                  required
                />
              </label>

              <p id="password-help" className="form-hint">
                Use a password with at least 15 characters.
                A long passphrase is easier to remember.
              </p>

              <label className="filter-field">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={15}
                  required
                />
              </label>

              {error && (
                <p className="filter-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}

export default RegisterPage;