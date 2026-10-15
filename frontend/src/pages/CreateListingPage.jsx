import { useContext, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";

const initialForm = {
  title: "",
  description: "",
  listingType: "individual",
  gemType: "",
  weightCarats: "",
  stoneCount: "1",
  askingPrice: "",
  location: "",
};

function CreateListingPage() {
  const { user, token } = useContext(AuthContext);

  const [form, setForm] = useState({ ...initialForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [created, setCreated] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => {
      if (name === "listingType") {
        return {
          ...current,
          listingType: value,
          stoneCount: value === "individual" ? "1" : "2",
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const weightCarats = Number(form.weightCarats);
    const stoneCount = Number(form.stoneCount);
    const askingPrice = Number(form.askingPrice);

    if (
      form.title.trim().length < 5 ||
      form.description.trim().length < 20 ||
      form.location.trim().length < 2
    ) {
      setError(
        "Enter a title of at least 5 characters, a description of at least 20, and a location of at least 2."
      );
      return;
    }

    if (
      !Number.isFinite(weightCarats) ||
      weightCarats <= 0 ||
      !Number.isFinite(askingPrice) ||
      askingPrice <= 0
    ) {
      setError("Weight and asking price must be positive numbers.");
      return;
    }

    if (
      !Number.isInteger(stoneCount) ||
      (form.listingType === "individual" && stoneCount !== 1) ||
      (form.listingType === "lot" && stoneCount < 2)
    ) {
      setError("Individual listings need 1 stone; lots need at least 2.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          listingType: form.listingType,
          gemType: form.gemType.trim(),
          weightCarats,
          stoneCount,
          askingPrice,
          location: form.location.trim(),
        }),
      });

      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create listing.");
        return;
      }

      setCreated(true);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="container details-page">
        <Link className="back-link" to="/my-listings">
          ← Back to my listings
        </Link>

        <h1>Create listing</h1>

        {!user || !token ? (
          <div className="state-box">
            <p>Please log in with a seller account.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : user.role !== "seller" ? (
          <p className="state-box">
            Only seller accounts can create listings.
          </p>
        ) : sessionExpired ? (
          <div className="state-box" role="alert">
            <p>Your session has expired. Please log in again.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : created ? (
          <section className="state-box" role="status">
            <h2>Listing created</h2>
            <p>
              Your listing is pending moderation.
              At least one photo is required before approval.
            </p>
            <Link className="details-link" to="/my-listings">
              View my listings
            </Link>
          </section>
        ) : (
          <form className="listing-form" onSubmit={handleSubmit}>
            <label className="filter-field">
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                minLength={5}
                maxLength={120}
                required
              />
            </label>

            <label className="filter-field">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                minLength={20}
                maxLength={2000}
                rows={6}
                required
              />
            </label>

            <div className="listing-form-grid">
              <label className="filter-field">
                Listing type
                <select
                  name="listingType"
                  value={form.listingType}
                  onChange={handleChange}
                >
                  <option value="individual">Individual stone</option>
                  <option value="lot">Gem lot</option>
                </select>
              </label>

              <label className="filter-field">
                Gem type (optional, seller-provided)
                <input
                  name="gemType"
                  value={form.gemType}
                  onChange={handleChange}
                  maxLength={80}
                />
              </label>

              <label className="filter-field">
                Total weight (carats)
                <input
                  type="number"
                  name="weightCarats"
                  value={form.weightCarats}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  required
                />
              </label>

              <label className="filter-field">
                Stone count
                <input
                  type="number"
                  name="stoneCount"
                  value={form.stoneCount}
                  onChange={handleChange}
                  min={form.listingType === "lot" ? 2 : 1}
                  step="1"
                  readOnly={form.listingType === "individual"}
                  required
                />
              </label>

              <label className="filter-field">
                Total asking price (LKR)
                <input
                  type="number"
                  name="askingPrice"
                  value={form.askingPrice}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>

              <label className="filter-field">
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </label>
            </div>

            <p className="inquiry-note">
              For a lot, enter the combined weight and total price
              for all stones. Listing approval does not certify
              gem authenticity.
            </p>

            {error && (
              <p className="filter-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create listing"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}

export default CreateListingPage;