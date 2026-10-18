import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";

function EditListingPage() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isSeller = user?.role === "seller";

  useEffect(() => {
    if (!isSeller || !token) {
      return;
    }

    const controller = new AbortController();

    async function loadListing() {
      setLoading(true);
      setError("");
      setSuccess("");
      setForm(null);
      setSessionExpired(false);

      try {
        // This endpoint returns only the logged-in seller's listings.
        const response = await fetch("/api/listings/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            setSessionExpired(true);
          }
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load listing.");
        }

        const listing = data.listings.find(
          (item) => item._id === id
        );

        if (!listing) {
          throw new Error("Your listing was not found.");
        }

        if (!controller.signal.aborted) {
          setForm({
            title: listing.title,
            description: listing.description,
            listingType: listing.listingType,
            gemType: listing.gemType || "",
            weightCarats: String(listing.weightCarats),
            stoneCount: String(listing.stoneCount),
            askingPrice: String(listing.askingPrice),
            location: listing.location,
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => controller.abort();
  }, [id, token, isSeller, retryCount]);

  function handleChange(event) {
    const { name, value } = event.target;

    setSuccess("");

    setForm((current) => {
      if (name === "listingType") {
        return {
          ...current,
          listingType: value,
          stoneCount: value === "individual" ? "1" : "2",
        };
      }

      return { ...current, [name]: value };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    const weightCarats = Number(form.weightCarats);
    const stoneCount = Number(form.stoneCount);
    const askingPrice = Number(form.askingPrice);

    if (
      form.title.trim().length < 5 ||
      form.description.trim().length < 20 ||
      form.location.trim().length < 2
    ) {
      setError(
        "Title needs at least 5 characters, description 20, and location 2."
      );
      return;
    }

    if (
      !Number.isFinite(weightCarats) ||
      weightCarats <= 0 ||
      !Number.isFinite(askingPrice) ||
      askingPrice <= 0
    ) {
      setError("Weight and price must be positive numbers.");
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

    setSaving(true);

    try {
      const response = await fetch(
        `/api/listings/${encodeURIComponent(id)}`,
        {
          method: "PUT",
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
        }
      );

      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update listing.");
        return;
      }

      setSuccess("Listing updated and sent for admin review.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="container details-page">
        <Link className="back-link" to="/my-listings">
          ← Back to my listings
        </Link>

        <h1>Edit listing</h1>

        {!user || !token ? (
          <div className="state-box">
            <p>Please log in with a seller account.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : !isSeller ? (
          <p className="state-box">
            Only sellers can edit listings.
          </p>
        ) : sessionExpired ? (
          <div className="state-box" role="alert">
            <p>Your session has expired. Please log in again.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : loading ? (
          <p className="state-box" role="status">
            Loading listing...
          </p>
        ) : !form ? (
          <div className="state-box" role="alert">
            <p>{error}</p>
            <button
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
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
                disabled={saving}
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
                disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                  required
                />
              </label>
            </div>

            <p className="inquiry-note">
              Saving changes returns this listing to pending review.
              Existing photos will remain attached.
            </p>

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

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}

export default EditListingPage;