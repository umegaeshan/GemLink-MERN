import { useState } from "react";

function DeleteListingButton({
  listing,
  token,
  onDeleted,
  onExpired,
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/listings/${listing._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        onExpired();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to delete listing.");
        return;
      }

      onDeleted(listing._id, data.message);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="danger-button"
        onClick={() => {
          setError("");
          setConfirming(true);
        }}
      >
        Delete listing
      </button>
    );
  }

  return (
    <div className="delete-confirmation">
      <p>
        Delete <strong>{listing.title}</strong> and its photos?
        This cannot be undone.
      </p>

      {error && (
        <p className="filter-error" role="alert">
          {error}
        </p>
      )}

      <div className="filter-actions">
        <button
          type="button"
          className="danger-button"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Yes, delete"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DeleteListingButton;