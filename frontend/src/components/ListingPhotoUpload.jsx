import { useRef, useState } from "react";

function ListingPhotoUpload({
  listing,
  token,
  onUploaded,
  onExpired,
}) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const remaining = Math.max(0, 5 - listing.photos.length);

  function handleFilesChange(event) {
    setFiles(Array.from(event.target.files || []));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (files.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    if (files.length > remaining) {
      setError(`You can add only ${remaining} more photos.`);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError("Use JPG, PNG or WebP images.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Each photo must be 5 MB or smaller.");
        return;
      }
    }

    const formData = new FormData();

    for (const file of files) {
      formData.append("photos", file);
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/listings/${listing._id}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        onExpired();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to upload photos.");
        return;
      }

      onUploaded(data.listing);
      setFiles([]);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setSuccess("Photos uploaded. Listing is pending moderation.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="photo-upload">
      <h3>Add photos</h3>

      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}

      {remaining === 0 ? (
        <p className="inquiry-note">
          This listing already has 5 photos.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="filter-field">
            Choose photos
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFilesChange}
              disabled={loading}
            />
          </label>

          <p className="inquiry-note">
            Up to {remaining} more photos. JPG, PNG or WebP,
            maximum 5 MB and 25 megapixels per image.
            Animated images are not supported.
          </p>

          {files.length > 0 && (
            <p>{files.length} photos selected.</p>
          )}

          <p className="inquiry-note">
            Adding photos sends the listing back for admin review.
          </p>

          {error && (
            <p className="filter-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || files.length === 0}
          >
            {loading ? "Uploading..." : "Upload photos"}
          </button>
        </form>
      )}
    </section>
  );
}

export default ListingPhotoUpload;