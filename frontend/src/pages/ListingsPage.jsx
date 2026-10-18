import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import ListingFilters from "../components/ListingFilters";
import GemstoneCard from "../components/GemstoneCard";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

function ListingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.toString();

    const pageText = searchParams.get("page") || "1";
    const pageValue = Number(pageText);

    const page =
        /^[1-9][0-9]*$/.test(pageText) &&
            Number.isSafeInteger(pageValue) &&
            pageValue <= 10000
            ? pageValue
            : 1;

    const initialFilters = {
        search: searchParams.get("search") || "",
        listingType: ["individual", "lot"].includes(
            searchParams.get("listingType")
        )
            ? searchParams.get("listingType")
            : "",
        location: searchParams.get("location") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
    };

    const [listings, setListings] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    function applyFilters(filters) {
        const params = new URLSearchParams();

        for (const [name, value] of Object.entries(filters)) {
            if (value !== "") {
                params.set(name, value);
            }
        }

        setSearchParams(params);
    }

    function changePage(nextPage) {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(nextPage));
        setSearchParams(params);
    }

    useEffect(() => {
        const controller = new AbortController();

        async function loadListings() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams(query);
                params.set("page", String(page));

                const response = await fetch(`/api/listings?${params}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.message || "Unable to load gemstones.");
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
    }, [query, page, retryCount]);

    return (
        <>
            <SiteHeader />

            <main className="container browse-page">
                <section className="browse-heading">
                    <p className="eyebrow">THE MARKETPLACE</p>
                    <h1>Browse gemstones</h1>
                    <p>
                        Find a stone you like. Open it to see photos,
                        read the details and ask the seller a question.
                    </p>
                </section>

                <div className="browse-layout">
                    <aside className="browse-sidebar" aria-label="Filter gemstones">
                        <ListingFilters
                            key={query}
                            initialFilters={initialFilters}
                            onApply={applyFilters}
                        />
                    </aside>

                    <section className="market-section" aria-label="Gemstone results">
                        <div className="section-heading">
                            <h2>Available gemstones</h2>
                            {!loading && !error && (
                                <span>{total} {total === 1 ? "listing" : "listings"} found</span>
                            )}
                        </div>

                        {loading ? (
                            <p className="state-box" role="status">Finding gemstones...</p>
                        ) : error ? (
                            <div className="state-box" role="alert">
                                <p>{error}</p>
                                <div className="state-actions">
                                    <button onClick={() => setRetryCount((count) => count + 1)}>
                                        Try again
                                    </button>
                                    <button
                                        className="secondary-button"
                                        onClick={() => setSearchParams({})}
                                    >
                                        Reset search
                                    </button>
                                </div>
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="state-box">
                                <h3>No gemstones found</h3>
                                <p>Try a different search or remove your filters.</p>
                                <button onClick={() => setSearchParams({})}>
                                    Show all gemstones
                                </button>
                            </div>
                        ) : (
                            <div className="listing-grid">
                                {listings.map((listing) => (
                                    <GemstoneCard key={listing._id} listing={listing} />
                                ))}
                            </div>
                        )}

                        {!loading && !error && (totalPages > 1 || page > 1) && (
                            <nav className="pagination" aria-label="Results pages">
                                <button
                                    disabled={page === 1}
                                    onClick={() => changePage(page - 1)}
                                >
                                    Previous
                                </button>

                                <span>Page {page} · {totalPages} total pages</span>

                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => changePage(page + 1)}
                                >
                                    Next
                                </button>
                            </nav>
                        )}

                        <p className="market-disclaimer">
                            Seller-provided details. Approval does not certify
                            gemstone authenticity.
                        </p>
                    </section>
                </div>
            </main>

            <SiteFooter />
        </>
    );
}

export default ListingsPage;