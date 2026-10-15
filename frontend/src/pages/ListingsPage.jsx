import { useEffect, useState } from "react";
import { Link } from "react-router";
import ListingFilters from "../components/ListingFilters";
import SiteHeader from "../components/SiteHeader";

function ListingCard({ listing }) {
    const [imageFailed, setImageFailed] = useState(false);

    const firstPhoto = listing.photos?.[0];
    const filename = firstPhoto?.split("/").pop();

    const imageUrl = filename
        ? `/api/listings/${listing._id}/public-photos/${encodeURIComponent(filename)}`
        : "";

    return (
        <article className="listing-card">
            {imageUrl && !imageFailed ? (
                <img
                    className="listing-image"
                    src={imageUrl}
                    alt={listing.title}
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                />
            ) : (
                <div className="image-placeholder">
                    Photo unavailable
                </div>
            )}

            <div className="listing-content">
                <span className="listing-type">
                    {listing.listingType === "lot"
                        ? "Gem lot"
                        : "Individual stone"}
                </span>

                <h2>{listing.title}</h2>

                <p className="listing-price">
                    LKR {listing.askingPrice.toLocaleString("en-LK")}
                </p>

                <p className="listing-meta">
                    {listing.weightCarats} ct · {listing.stoneCount}{" "}
                    {listing.stoneCount === 1 ? "stone" : "stones"}
                </p>

                <p className="listing-location">
                    {listing.location}
                </p>
                <Link
                    className="details-link"
                    to={`/listings/${listing._id}`}
                >
                    View details
                </Link>
            </div>
        </article>
    );
}

function ListingsPage() {
    const [listings, setListings] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const [appliedFilters, setAppliedFilters] = useState({});

    function applyFilters(filters) {
        setAppliedFilters(filters);
        setPage(1);
    }

    useEffect(() => {
        const controller = new AbortController();

        async function loadListings() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams({
                    page: String(page),
                });

                for (const [key, value] of Object.entries(appliedFilters)) {
                    if (value !== "") {
                        params.set(key, value);
                    }
                }

                const response = await fetch(
                    `/api/listings?${params.toString()}`,
                    {
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load listings. Please try again."
                    );
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setListings(data.listings);
                    setTotalPages(data.totalPages);
                    setTotal(data.total);
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
    }, [page, retryCount, appliedFilters]);

    return (
        <>
        <SiteHeader />

            <main className="container">
                <section className="hero">
                    <p className="eyebrow">
                        EXPLORE ROUGH GEMSTONES
                    </p>

                    <h1>Find your next discovery.</h1>

                    <p>
                        Browse individual rough stones and gem lots
                        listed by sellers.
                    </p>
                </section>

                <aside className="authenticity-notice">
                    Gem type and details are seller-provided.
                    Listing approval does not certify authenticity.
                </aside>

                <ListingFilters onApply={applyFilters} />

                <section
                    className="market-section"
                    aria-label="Gem listings"
                >
                    <div className="section-heading">
                        <h2>Explore listings</h2>

                        {!loading && !error && (
                            <span>
                                {total} {total === 1 ? "listing" : "listings"}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <p className="state-box" role="status">
                            Loading listings...
                        </p>
                    ) : error ? (
                        <div className="state-box" role="alert">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() =>
                                    setRetryCount((count) => count + 1)
                                }
                            >
                                Try again
                            </button>
                        </div>
                    ) : listings.length === 0 ? (
                        <p className="state-box">
                            No listings found on this page. Try changing
                            your filters or returning to the previous page.
                        </p>
                    ) : (
                        <div className="listing-grid">
                            {listings.map((listing) => (
                                <ListingCard
                                    key={listing._id}
                                    listing={listing}
                                />
                            ))}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        (totalPages > 1 || page > 1) && (
                            <nav
                                className="pagination"
                                aria-label="Listing pages"
                            >
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() =>
                                        setPage((current) => current - 1)
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {page} · {totalPages} total pages
                                </span>

                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((current) => current + 1)
                                    }
                                >
                                    Next
                                </button>
                            </nav>
                        )}
                </section>
            </main>

            <footer className="site-footer">
                GemLink · Connect with rough gem sellers.
            </footer>
        </>
    );
}

export default ListingsPage;