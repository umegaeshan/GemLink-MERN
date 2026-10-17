import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import InquiryForm from "../components/InquiryForm";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ListingGallery from "../components/ListingGallery";

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
          throw new Error(
            "Unable to load this listing. Please try again."
          );
        }

        const data = await response.json();

        if (!data.listing) {
          throw new Error("Listing details are unavailable.");
        }

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
      <SiteHeader />

      <main className="container details-page">
        <Link className="back-link" to="/browse">
          ← Back to gemstones
        </Link>

        {loading ? (
          <p className="state-box" role="status">
            Loading gemstone details...
          </p>
        ) : error ? (
          <div className="state-box" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : listing ? (
          <>
            <div className="details-layout">
              <ListingGallery
                key={listing._id}
                listing={listing}
              />

              <section
                className="details-panel"
                aria-labelledby="listing-title"
              >
                <span className="listing-type">
                  {listing.listingType === "lot"
                    ? "Gemstone bundle"
                    : "Single gemstone"}
                </span>

                <h1 id="listing-title">{listing.title}</h1>

                <p className="inquiry-note">Asking price</p>

                <p className="listing-price">
                  LKR {listing.askingPrice.toLocaleString("en-LK")}
                </p>

                <dl className="detail-facts">
                  <div>
                    <dt>Total weight</dt>
                    <dd>{listing.weightCarats} carats</dd>
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

                <InquiryForm
                  key={listing._id}
                  listingId={listing._id}
                />
              </section>
            </div>

            <aside className="authenticity-notice">
              Gem type and details are seller-provided.
              Listing approval does not certify authenticity.
            </aside>
          </>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}

export default ListingDetailsPage;