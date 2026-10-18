import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ListingPhotoUpload from "../components/ListingPhotoUpload";
import PrivateListingPhoto from "../components/PrivateListingPhoto";
import DeleteListingButton from "../components/DeleteListingButton";

function MyListingsPage() {
  const { user, token } = useContext(AuthContext);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteMessage, setDeleteMessage] = useState("");

  const isSeller = user?.role === "seller";
  const canManage = isSeller && token && !sessionExpired;

  useEffect(() => {
    if (!isSeller || !token) return;

    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);
      setError("");
      setSessionExpired(false);
      setListings([]);

      try {
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
          throw new Error(
            data.message || "Unable to load your listings."
          );
        }

        if (!Array.isArray(data.listings)) {
          throw new Error("The server returned invalid listing data.");
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
  }, [token, isSeller, retryCount]);

  function handlePhotosUploaded(updatedListing) {
    setListings((current) =>
      current.map((listing) =>
        listing._id === updatedListing._id
          ? updatedListing
          : listing
      )
    );
  }

  function handleDeleted(listingId, message) {
    setListings((current) =>
      current.filter((listing) => listing._id !== listingId)
    );

    setDeleteMessage(message || "Listing deleted.");
  }

  return (
    <>
      <SiteHeader />

      <main className="container inquiries-page seller-dashboard">
        <div className="seller-page-heading">
          <div>
            <p className="eyebrow">SELLER DASHBOARD</p>
            <h1>My listings</h1>
            <p className="seller-page-description">
              Add gemstones, manage photos and track listing approval.
            </p>
          </div>

          {canManage && (
            <Link
              className="seller-action seller-action-primary"
              to="/my-listings/new"
            >
              <span className="seller-plus" aria-hidden="true">+</span>
              Add a gemstone
            </Link>
          )}
        </div>

        {canManage && deleteMessage && (
          <p className="success-message seller-feedback" role="status">
            {deleteMessage}
          </p>
        )}

        {!user || !token ? (
          <div className="state-box">
            <p>Please log in with a seller account.</p>
            <Link
              className="seller-action seller-action-primary"
              to="/login"
            >
              Go to login
            </Link>
          </div>
        ) : !isSeller ? (
          <p className="state-box">
            This page is available to seller accounts only.
          </p>
        ) : sessionExpired ? (
          <div className="state-box" role="alert">
            <p>Your session has expired. Please log in again.</p>
            <Link
              className="seller-action seller-action-primary"
              to="/login"
            >
              Log in again
            </Link>
          </div>
        ) : loading ? (
          <p className="state-box" role="status">
            Loading your listings...
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
        ) : (
          <>
            <div className="section-heading seller-list-toolbar">
              <h2>
                {listings.length}{" "}
                {listings.length === 1 ? "listing" : "listings"}
              </h2>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Reload listings
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="state-box">
                <h2>Add your first gemstone</h2>
                <p>
                  Create a listing with details and photos.
                  It will appear publicly after admin approval.
                </p>

                <Link
                  className="seller-action seller-action-primary"
                  to="/my-listings/new"
                >
                  <span className="seller-plus" aria-hidden="true">+</span>
                  Add a gemstone
                </Link>
              </div>
            ) : (
              <div className="inquiries-list">
                {listings.map((listing) => {
                  const photos = listing.photos || [];

                  return (
                    <article
                      className="inquiry-card seller-listing-card"
                      key={listing._id}
                    >
                      <div className="inquiry-heading">
                        <div>
                          <h2>{listing.title}</h2>

                          <p className="inquiry-date">
                            Created:{" "}
                            {new Date(
                              listing.createdAt
                            ).toLocaleDateString("en-LK")}
                          </p>
                        </div>

                        <span className={`status-badge ${listing.status}`}>
                          {listing.status}
                        </span>
                      </div>

                      <p className="listing-price">
                        LKR {listing.askingPrice.toLocaleString("en-LK")}
                      </p>

                      <p className="listing-meta">
                        {listing.listingType === "lot"
                          ? "Gem lot"
                          : "Individual stone"}
                        {" · "}
                        {listing.weightCarats} ct
                        {" · "}
                        {listing.stoneCount}{" "}
                        {listing.stoneCount === 1 ? "stone" : "stones"}
                      </p>

                      <p className="listing-location">
                        {listing.location}
                      </p>

                      <div className="seller-photos-heading">
                        <h3>Listing photos</h3>
                        <span>{photos.length} / 5</span>
                      </div>

                      {photos.length > 0 ? (
                        <div className="seller-photo-grid">
                          {photos.map((photoPath, index) => (
                            <PrivateListingPhoto
                              key={photoPath}
                              listingId={listing._id}
                              photoPath={photoPath}
                              token={token}
                              alt={`${listing.title}, photo ${index + 1}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="inquiry-note">
                          No photos yet. Add clear photos below.
                        </p>
                      )}

                      <ListingPhotoUpload
                        listing={listing}
                        token={token}
                        onUploaded={handlePhotosUploaded}
                        onExpired={() => setSessionExpired(true)}
                      />

                      {listing.status === "pending" && (
                        <p className="inquiry-note">
                          Awaiting admin review. This listing is not
                          visible in the public marketplace yet.
                        </p>
                      )}

                      {listing.status === "rejected" && (
                        <div className="seller-response">
                          <h3>Changes requested</h3>
                          <p className="inquiry-text">
                            {listing.rejectionReason || "No reason provided."}
                          </p>
                        </div>
                      )}

                      <div className="listing-actions seller-card-actions">
                        <Link
                          className="seller-action seller-action-edit"
                          to={`/my-listings/${listing._id}/edit`}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path d="m16 3 5 5-12 12-6 1 1-6L16 3Z" />
                            <path d="m13 6 5 5" />
                          </svg>
                          Edit listing
                        </Link>

                        {listing.status === "approved" && (
                          <Link
                            className="seller-action seller-action-outline"
                            to={`/listings/${listing._id}`}
                          >
                            View public listing
                            <span aria-hidden="true">↗</span>
                          </Link>
                        )}

                        <DeleteListingButton
                          listing={listing}
                          token={token}
                          onDeleted={handleDeleted}
                          onExpired={() => setSessionExpired(true)}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

export default MyListingsPage;