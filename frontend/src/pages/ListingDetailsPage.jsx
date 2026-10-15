import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

function ListingPhoto({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="image-placeholder">
        Photo unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="detail-photo"
      onError={() => setFailed(true)}
    />
  );
}

function ListingDetailsPage() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadListing() {
      setLoading(true);
      setError("");
      setListing(null);

      try {
        const response = await fetch(
          `/api/listings/${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );

        if (response.status === 404) {
          throw new Error("This listing is no longer available.");
        }

        if (response.status === 400) {
          throw new Error("Invalid listing link.");
        }

        if (!response.ok) {
          throw new Error("Unable to load this listing.");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setListing(data.listing);
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
  }, [id, retryCount]);

  return (
    <>
      <header className="site-header">
        <div className="container header-content">
          <Link className="brand" to="/">
            GemLink
          </Link>

          <span className="header-note">
            Rough Gem Marketplace
          </span>
        </div>
      </header>

      <main className="container details-page">
        <Link className="back-link" to="/">
          ← Back to listings
        </Link>

        {loading ? (
          <p className="state-box" role="status">
            Loading listing...
          </p>
        ) : error ? (
          <div className="state-box" role="alert">
            <p>{error}</p>

            <button
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : listing ? (
          <>
            <div className="details-layout">
              <section
                className="detail-gallery"
                aria-label="Listing photos"
              >
                {listing.photos.length > 0 ? (
                  listing.photos.map((photo, index) => {
                    const filename = photo.split("/").pop();

                    const imageUrl =
                      `/api/listings/${listing._id}/public-photos/` +
                      encodeURIComponent(filename);

                    return (
                      <ListingPhoto
                        key={photo}
                        src={imageUrl}
                        alt={`${listing.title}, photo ${index + 1}`}
                      />
                    );
                  })
                ) : (
                  <div className="image-placeholder">
                    No photos available
                  </div>
                )}
              </section>

              <section className="details-panel">
                <span className="listing-type">
                  {listing.listingType === "lot"
                    ? "Gem lot"
                    : "Individual stone"}
                </span>

                <h1>{listing.title}</h1>

                <p className="listing-price">
                  LKR {listing.askingPrice.toLocaleString("en-LK")}
                </p>

                <dl className="detail-facts">
                  <div>
                    <dt>Total weight</dt>
                    <dd>{listing.weightCarats} ct</dd>
                  </div>

                  <div>
                    <dt>Stone count</dt>
                    <dd>{listing.stoneCount}</dd>
                  </div>

                  <div>
                    <dt>Location</dt>
                    <dd>{listing.location}</dd>
                  </div>

                  <div>
                    <dt>Gem type (seller-provided)</dt>
                    <dd>{listing.gemType || "Not specified"}</dd>
                  </div>
                </dl>

                <h2>Description</h2>

                <p className="detail-description">
                  {listing.description}
                </p>
              </section>
            </div>

            <aside className="authenticity-notice">
              Gem type and details are seller-provided.
              Listing approval does not certify authenticity.
            </aside>
          </>
        ) : null}
      </main>
    </>
  );
}

export default ListingDetailsPage;