import { useState } from "react";

function ListingGallery({ listing }) {
  const photos = listing.photos || [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  const activeIndex =
    photos.length > 0 ? selectedIndex % photos.length : 0;

  function getPhotoUrl(photoPath) {
    const filename = photoPath.split("/").pop();

    return (
      `/api/listings/${listing._id}/public-photos/` +
      encodeURIComponent(filename)
    );
  }

  function markFailed(url) {
    setFailedImages((current) => ({
      ...current,
      [url]: true,
    }));
  }

  function showPrevious() {
    setSelectedIndex(
      (current) => (current + photos.length - 1) % photos.length
    );
  }

  function showNext() {
    setSelectedIndex((current) => (current + 1) % photos.length);
  }

  function handleKeyDown(event) {
    if (photos.length < 2) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  }

  if (photos.length === 0) {
    return (
      <section className="listing-gallery" aria-label="Listing photos">
        <div className="gallery-main gallery-empty">
          <span aria-hidden="true">◇</span>
          <p>No photos available</p>
        </div>
      </section>
    );
  }

  const activeUrl = getPhotoUrl(photos[activeIndex]);

  return (
    <section
      className="listing-gallery"
      aria-label={`${listing.title} photos`}
      onKeyDown={handleKeyDown}
    >
      <div
        className="gallery-main"
        tabIndex={0}
        role="group"
        aria-label={`Photo ${activeIndex + 1} of ${photos.length}. Use left and right arrow keys to change photos.`}
      >
        {failedImages[activeUrl] ? (
          <div className="gallery-empty">
            <span aria-hidden="true">◇</span>
            <p>This photo could not be loaded.</p>
          </div>
        ) : (
          <img
            key={activeUrl}
            className="gallery-main-image"
            src={activeUrl}
            alt={`${listing.title}, photo ${activeIndex + 1}`}
            onError={() => markFailed(activeUrl)}
          />
        )}

        <span className="gallery-count" aria-hidden="true">
          {activeIndex + 1} / {photos.length}
        </span>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-previous"
              onClick={showPrevious}
              aria-label="Previous photo"
            >
              ‹
            </button>

            <button
              type="button"
              className="gallery-arrow gallery-next"
              onClick={showNext}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <>
          <div className="gallery-thumbnails" aria-label="Choose a photo">
            {photos.map((photo, index) => {
              const photoUrl = getPhotoUrl(photo);

              return (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  className={`gallery-thumbnail ${
                    index === activeIndex ? "is-selected" : ""
                  }`}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => setSelectedIndex(index)}
                >
                  {failedImages[photoUrl] ? (
                    <span className="thumbnail-fallback">
                      Photo {index + 1}
                    </span>
                  ) : (
                    <img
                      src={photoUrl}
                      alt=""
                      loading="lazy"
                      onError={() => markFailed(photoUrl)}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="gallery-hint">
            Select a thumbnail or use the arrows to view more photos.
          </p>
        </>
      )}

      <span className="gallery-screen-reader" role="status">
        Photo {activeIndex + 1} of {photos.length}
      </span>
    </section>
  );
}

export default ListingGallery;