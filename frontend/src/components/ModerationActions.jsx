import { useState } from "react";

function ModerationActions({
  listing,
  token,
  onReviewed,
  onExpired,
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitDecision(action) {
    if (loading) {
      return;
    }

    setError("");

    if (
      action === "reject" &&
      (reason.trim().length < 5 || reason.trim().length > 500)
    ) {
      setError("Rejection reason must contain 5 to 500 characters.");
      return;
    }

    setLoading(true);

    try {
      const options = {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (action === "reject") {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify({
          rejectionReason: reason.trim(),
        });
      }

      const response = await fetch(
        `/api/admin/listings/${listing._id}/${action}`,
        options
      );

      if (response.status === 401) {
        onExpired();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to review listing.");
        return;
      }

      onReviewed(listing._id, data.message);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="moderation-actions">
      <label className="filter-field">
        Rejection reason
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Required only when rejecting a listing"
          disabled={loading}
        />
      </label>

      {listing.photos.length === 0 && (
        <p className="inquiry-note">
          At least one photo is required before approval.
        </p>
      )}

      {error && (
        <p className="filter-error" role="alert">
          {error}
        </p>
      )}

      <div className="filter-actions">
        <button
          type="button"
          disabled={loading || listing.photos.length === 0}
          onClick={() => submitDecision("approve")}
        >
          Approve listing
        </button>

        <button
          type="button"
          className="danger-button"
          disabled={loading}
          onClick={() => submitDecision("reject")}
        >
          Reject listing
        </button>
      </div>

      {loading && <p role="status">Saving decision...</p>}
    </div>
  );
}

export default ModerationActions;