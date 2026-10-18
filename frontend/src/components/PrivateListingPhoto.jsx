import { useEffect, useState } from "react";

function PrivateListingPhoto({
  listingId,
  photoPath,
  token,
  alt,
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    async function loadPhoto() {
      setImageUrl("");
      setError("");

      if (!token) {
        setError("Please log in to view this photo.");
        return;
      }

      if (
        typeof photoPath !== "string" ||
        !photoPath ||
        !listingId
      ) {
        setError("This photo has an invalid saved path.");
        return;
      }

      const filename = photoPath.split("/").pop();

      if (!filename) {
        setError("The saved photo filename is missing.");
        return;
      }

      try {
        const response = await fetch(
          `/api/listings/${encodeURIComponent(listingId)}/photos/${encodeURIComponent(filename)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          let message = "Unable to load this photo.";

          if (response.status === 400) {
            message = "The listing ID or photo filename was rejected.";
          } else if (response.status === 401) {
            message = "Session expired. Please log in again.";
          } else if (response.status === 403) {
            message = "You do not have permission to view this photo.";
          } else if (response.status === 404) {
            message = "Photo or photo route not found.";
          } else if (response.status >= 500) {
            message = "The server could not load this photo.";
          }

          // Display the backend's message when it returns JSON.
          const contentType = response.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            const data = await response.json().catch(() => null);

            if (typeof data?.message === "string") {
              message = data.message;
            }
          }

          throw new Error(`${response.status}: ${message}`);
        }

        const blob = await response.blob();

        if (!blob.type.startsWith("image/")) {
          throw new Error(
            "The server returned a response that is not an image."
          );
        }

        if (controller.signal.aborted) return;

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof TypeError
              ? "Cannot reach the server. Check the backend connection."
              : error.message
          );
        }
      }
    }

    loadPhoto();

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [listingId, photoPath, token, retryCount]);

  if (error) {
    return (
      <div className="private-photo-placeholder photo-load-error">
        <span className="photo-error-heading">Photo unavailable</span>
        <p>{error}</p>

        <button
          type="button"
          className="photo-retry-button"
          onClick={() => setRetryCount((count) => count + 1)}
          aria-label={`Retry loading ${alt || "photo"}`}
        >
          Retry photo
        </button>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="private-photo-placeholder" role="status">
        Loading photo...
      </div>
    );
  }

  return (
    <img
      className="private-photo"
      src={imageUrl}
      alt={alt || "Listing photo"}
      onError={() =>
        setError("The downloaded file could not be displayed as an image.")
      }
    />
  );
}

export default PrivateListingPhoto;