import { useContext, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";

function InquiryForm({ listingId }) {
  const { user, token, logout } = useContext(AuthContext);

  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    const cleanMessage = message.trim();

    if (cleanMessage.length < 10 || cleanMessage.length > 1000) {
      setError("Message must contain between 10 and 1000 characters.");
      return;
    }

    const price = offerPrice === "" ? null : Number(offerPrice);

    if (price !== null && (!Number.isFinite(price) || price <= 0)) {
      setError("Offer price must be a positive number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId,
          message: cleanMessage,
          offerPrice: price,
        }),
      });

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send inquiry.");
        return;
      }

      setMessage("");
      setOfferPrice("");
      setSuccess("Your inquiry was sent successfully.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <section className="inquiry-box">
        <h2>Interested in this listing?</h2>

        {error && (
          <p className="filter-error" role="alert">
            {error}
          </p>
        )}

        <p>
          <Link to="/login">Log in</Link> with a buyer account
          to send an inquiry or offer.
        </p>
      </section>
    );
  }

  if (user.role !== "buyer") {
    return (
      <section className="inquiry-box">
        <p>Only buyer accounts can send inquiries.</p>
      </section>
    );
  }

  return (
    <section className="inquiry-box">
      <h2>Contact the seller</h2>

      <p className="inquiry-note">
        Ask about this listing or suggest a price.
        Sending an offer does not make a payment or complete a purchase.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="filter-field">
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            minLength={10}
            maxLength={1000}
            rows={5}
            placeholder="What would you like to ask the seller?"
            required
          />
        </label>

        <label className="filter-field">
          Offer price (LKR, optional)
          <input
            type="number"
            value={offerPrice}
            onChange={(event) => setOfferPrice(event.target.value)}
            min="0.01"
            step="0.01"
            placeholder="Leave empty to send only a message"
          />
        </label>

        {error && (
          <p className="filter-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send inquiry"}
        </button>
      </form>
    </section>
  );
}

export default InquiryForm;