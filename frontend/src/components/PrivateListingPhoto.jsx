import { useEffect, useState } from "react";

function PrivateListingPhoto({
  listingId,
  photoPath,
  token,
  alt,
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

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

      const filename = photoPath.split("/").pop();

      try {
        const response = await fetch(
          `/api/listings/${listingId}/photos/${encodeURIComponent(filename)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error("Photo unavailable.");
        }

        const blob = await response.blob();

        if (controller.signal.aborted) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
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
  }, [listingId, photoPath, token]);

  if (error) {
    return (
      <div className="private-photo-placeholder">
        {error}
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
      alt={alt}
      onError={() => setError("Photo unavailable.")}
    />
  );
}

export default PrivateListingPhoto;