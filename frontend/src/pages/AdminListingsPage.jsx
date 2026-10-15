import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import PrivateListingPhoto from "../components/PrivateListingPhoto";
import ModerationActions from "../components/ModerationActions";

function AdminListingsPage() {
  const { user, token } = useContext(AuthContext);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin || !token) {
      return;
    }

    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);
      setError("");
      setMessage("");
      setSessionExpired(false);
      setListings([]);

      try {
        const response = await fetch(
          "/api/admin/listings/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            setSessionExpired(true);
          }
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load listings.");
        }

        if (!controller.signal.aborted) {
          setListings(data.listings);
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

    loadListings();

    return () => controller.abort();
  }, [token, isAdmin, retryCount]);

  function handleReviewed(listingId, resultMessage) {
    setListings((current) =>
      current.filter((listing) => listing._id !== listingId)
    );

    setMessage(resultMessage);
  }

  return (
    <>
      <SiteHeader />

      <main className="container inquiries-page">
        <h1>Review listings</h1>

        <aside className="authenticity-notice">
          Review the listing details and photos before deciding.
          Approval does not certify gem authenticity.
        </aside>

        {!user || !token ? (
          <div className="state-box">
            <p>Please log in with an admin account.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : !isAdmin ? (
          <p className="state-box">
            This page is available to admins only.
          </p>
        ) : sessionExpired ? (
          <div className="state-box" role="alert">
            <p>Your session has expired. Please log in again.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : loading ? (
          <p className="state-box" role="status">
            Loading pending listings...
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
        ) : (
          <>
            <div className="section-heading moderation-heading">
              <h2>{listings.length} pending listings</h2>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Reload listings
              </button>
            </div>

            {message && (
              <p className="success-message" role="status">
                {message}
              </p>
            )}

            {listings.length === 0 ? (
              <p className="state-box">
                No listings are waiting for review.
              </p>
            ) : (
              <div className="inquiries-list">
                {listings.map((listing) => (
                  <article className="inquiry-card" key={listing._id}>
                    <div className="inquiry-heading">
                      <h2>{listing.title}</h2>
                      <span className="status-badge pending">
                        Pending
                      </span>
                    </div>

                    <p className="inquiry-date">
                      Created:{" "}
                      {new Date(listing.createdAt).toLocaleString("en-LK")}
                    </p>

                    <p className="listing-price">
                      LKR {listing.askingPrice.toLocaleString("en-LK")}
                    </p>

                    <dl className="detail-facts">
                      <div>
                        <dt>Listing type</dt>
                        <dd>{listing.listingType}</dd>
                      </div>

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

                    <h3>Description</h3>
                    <p className="inquiry-text">
                      {listing.description}
                    </p>

                    <div className="seller-photo-grid">
                      {listing.photos.map((photoPath, index) => (
                        <PrivateListingPhoto
                          key={photoPath}
                          listingId={listing._id}
                          photoPath={photoPath}
                          token={token}
                          alt={`${listing.title}, photo ${index + 1}`}
                        />
                      ))}
                    </div>

                    <ModerationActions
                      listing={listing}
                      token={token}
                      onReviewed={handleReviewed}
                      onExpired={() => setSessionExpired(true)}
                    />
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default AdminListingsPage;