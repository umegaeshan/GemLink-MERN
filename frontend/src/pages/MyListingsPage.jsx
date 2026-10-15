import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
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

    useEffect(() => {
        if (!isSeller || !token) {
            return;
        }

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
                    throw new Error(data.message || "Unable to load your listings.");
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

            <main className="container inquiries-page">
                <h1>My listings</h1>
                <p>View your listings and their moderation status.</p>

                {isSeller && token && !sessionExpired && deleteMessage && (
                    <p className="success-message" role="status">
                        {deleteMessage}
                    </p>
                )}

                {isSeller && token && !sessionExpired && (
                    <Link className="details-link" to="/my-listings/new">
                        + Create listing
                    </Link>
                )}

                {!user || !token ? (
                    <div className="state-box">
                        <p>Please log in with a seller account.</p>
                        <Link to="/login">Go to login</Link>
                    </div>
                ) : !isSeller ? (
                    <p className="state-box">
                        This page is available to seller accounts only.
                    </p>
                ) : sessionExpired ? (
                    <div className="state-box" role="alert">
                        <p>Your session has expired. Please log in again.</p>
                        <Link to="/login">Go to login</Link>
                    </div>
                ) : loading ? (
                    <p className="state-box" role="status">
                        Loading your listings...
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
                        <div className="section-heading">
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
                            <p className="state-box">
                                You have not created any listings yet.
                            </p>
                        ) : (
                            <div className="inquiries-list">
                                {listings.map((listing) => (
                                    <article className="inquiry-card" key={listing._id}>
                                        <div className="inquiry-heading">
                                            <h2>{listing.title}</h2>

                                            <span className={`status-badge ${listing.status}`}>
                                                {listing.status}
                                            </span>
                                        </div>

                                        <p className="inquiry-date">
                                            Created:{" "}
                                            {new Date(listing.createdAt).toLocaleDateString(
                                                "en-LK"
                                            )}
                                        </p>

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

                                        <p>
                                            Photos: {listing.photos.length} / 5
                                        </p>

                                        {listing.photos.length > 0 && (
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
                                        )}

                                        <ListingPhotoUpload
                                            listing={listing}
                                            token={token}
                                            onUploaded={handlePhotosUploaded}
                                            onExpired={() => setSessionExpired(true)}
                                        />

                                        {listing.status === "pending" && (
                                            <p className="inquiry-note">
                                                This listing is awaiting admin review.
                                            </p>
                                        )}

                                        {listing.status === "rejected" && (
                                            <div className="seller-response">
                                                <h3>Rejection reason</h3>
                                                <p className="inquiry-text">
                                                    {listing.rejectionReason ||
                                                        "No reason provided."}
                                                </p>
                                            </div>
                                        )}

                                        {listing.status === "approved" && (
                                            <Link
                                                className="details-link"
                                                to={`/listings/${listing._id}`}
                                            >
                                                View public listing
                                            </Link>
                                        )}

                                        <div className="listing-actions">
                                            <Link
                                                className="details-link"
                                                to={`/my-listings/${listing._id}/edit`}
                                            >
                                                Edit listing
                                            </Link>

                                            <DeleteListingButton
                                                listing={listing}
                                                token={token}
                                                onDeleted={handleDeleted}
                                                onExpired={() => setSessionExpired(true)}
                                            />
                                        </div>
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

export default MyListingsPage;