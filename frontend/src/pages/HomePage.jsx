import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import HeroVideo from "../components/HeroVideo";
import GemstoneCard from "../components/GemstoneCard";
import Reveal from "../components/Reveal";

function HomePage() {
  const { user } = useContext(AuthContext);
  const { hash, key: locationKey } = useLocation();

  const howItWorksRef = useRef(null);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [aboutImageFailed, setAboutImageFailed] = useState(false);

  const canSell = !user || user.role === "seller";
  const sellerLink = user ? "/my-listings/new" : "/register";

  useEffect(() => {
    if (hash === "#how-it-works") {
      howItWorksRef.current?.scrollIntoView({
        block: "start",
      });
    }
  }, [hash, locationKey]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/listings?page=1", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            "We could not load gemstones. Please try again."
          );
        }

        const data = await response.json();

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
  }, [retryCount]);

  return (
    <>
      <SiteHeader />

      <main>
        <HeroVideo />

        <section className="container home-section">
          <Reveal>
            <div className="home-about-grid">
              <div className="home-about-copy">
                <p className="eyebrow">WELCOME TO GEMLINK</p>

                <h2>
                  A simpler way to explore gemstones
                  and connect with sellers.
                </h2>

                <p className="home-about-description">
                  GemLink brings buyers and rough gemstone sellers
                  together. Browse single stones and gemstone bundles,
                  compare seller-provided details, and send questions
                  or price offers through your account.
                </p>

                <div className="home-benefits">
                  <div className="home-benefit">
                    <span aria-hidden="true">01</span>
                    <div>
                      <h3>Find what interests you</h3>
                      <p>
                        Search by title and filter by location,
                        listing type and asking price.
                      </p>
                    </div>
                  </div>

                  <div className="home-benefit">
                    <span aria-hidden="true">02</span>
                    <div>
                      <h3>Ask before you decide</h3>
                      <p>
                        View photos and send the seller a question
                        or an optional price offer.
                      </p>
                    </div>
                  </div>

                  <div className="home-benefit">
                    <span aria-hidden="true">03</span>
                    <div>
                      <h3>Manage everything in one place</h3>
                      <p>
                        Buyers can view replies. Sellers can manage
                        listings, upload photos and respond to inquiries.
                      </p>
                    </div>
                  </div>
                </div>

                <Link className="text-link" to="/about">
                  More about GemLink →
                </Link>
              </div>

              <figure className="home-about-visual">
                {!aboutImageFailed ? (
                  <img
                    src="/images/about-gemlink.png"
                    alt="Gemstones illustrating the GemLink marketplace"
                    width="600"
                    height="700"
                    loading="lazy"
                    onError={() => setAboutImageFailed(true)}
                  />
                ) : (
                  <div className="home-about-placeholder">
                    <span aria-hidden="true">◇</span>
                    <p>Explore the world of gemstones.</p>
                  </div>
                )}

                <figcaption>
                  <span>FROM DISCOVERY TO CONVERSATION</span>
                  <strong>Find a stone. Start a conversation.</strong>
                </figcaption>
              </figure>
            </div>
          </Reveal>
        </section>

        <section className="home-latest-band">
          <div className="container home-section">
            <Reveal>
              <div className="home-section-heading">
                <div>
                  <p className="eyebrow">
                    EXPLORE THE MARKETPLACE
                  </p>

                  <h2>Recently listed gemstones</h2>

                  <p>
                    Open a listing to see its details
                    and contact the seller.
                  </p>
                </div>

                <Link className="text-link" to="/browse">
                  View all gemstones →
                </Link>
              </div>
            </Reveal>

            {loading ? (
              <p className="state-box" role="status">
                Loading gemstones...
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
              <div className="state-box">
                <h3>No gemstones available yet</h3>
                <p>Approved seller listings will appear here.</p>

                {canSell && (
                  <Link className="text-link" to={sellerLink}>
                    Add a gemstone →
                  </Link>
                )}
              </div>
            ) : (
              <div className="listing-grid">
                {listings.slice(0, 6).map((listing) => (
                  <Reveal key={listing._id}>
                    <GemstoneCard listing={listing} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="how-it-works"
          ref={howItWorksRef}
          className="how-section"
        >
          <div className="container home-section">
            <Reveal>
              <div className="home-section-heading">
                <div>
                  <p className="eyebrow">
                    THREE SIMPLE STEPS
                  </p>
                  <h2>How GemLink works</h2>
                </div>
              </div>
            </Reveal>

            <div className="steps-grid">
              {[
                [
                  "01",
                  "Find a gemstone",
                  "Browse photos and asking prices. Use filters to find a single gemstone or a gemstone bundle.",
                ],
                [
                  "02",
                  "Ask the seller",
                  "Create a buyer account, open a listing and send a question or an optional price offer.",
                ],
                [
                  "03",
                  "Read their reply",
                  "Go to My account → My messages to see the seller’s response. An accepted offer is not a completed purchase.",
                ],
              ].map(([number, title, description]) => (
                <Reveal key={number}>
                  <article className="step-card">
                    <span className="step-number">
                      {number}
                    </span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {canSell && (
          <div className="container home-section">
            <Reveal>
              <section className="seller-banner">
                <div>
                  <p className="eyebrow">FOR SELLERS</p>
                  <h2>Have gemstones to sell?</h2>

                  <p>
                    Add photos, describe your gemstones and set
                    an asking price. Your listing appears after
                    admin review.
                  </p>
                </div>

                <Link className="gem-button" to={sellerLink}>
                  {user
                    ? "Add a gemstone →"
                    : "Create a seller account →"}
                </Link>
              </section>
            </Reveal>
          </div>
        )}

        <aside className="container home-disclaimer">
          Gem details are seller-provided.
          Listing approval does not certify authenticity.
          GemLink does not process payments or delivery.
        </aside>
      </main>

      <SiteFooter />
    </>
  );
}

export default HomePage;