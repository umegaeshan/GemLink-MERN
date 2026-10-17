import { useContext, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";

function HeroSlider({ listings = [], loading = false }) {
  const { user } = useContext(AuthContext);
  const [position, setPosition] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  const slides = listings
    .filter((listing) => listing.photos?.length > 0)
    .slice(0, 5);

  const activeIndex = slides.length > 0
    ? position % slides.length
    : 0;

  const activeListing = slides[activeIndex];
  const canSell = !user || user.role === "seller";

  function previousSlide() {
    setPosition(
      (current) => (current + slides.length - 1) % slides.length
    );
  }

  function nextSlide() {
    setPosition((current) => (current + 1) % slides.length);
  }

  function markImageFailed(url) {
    setFailedImages((current) => ({
      ...current,
      [url]: true,
    }));
  }

  return (
    <section
      className="hero-slider"
      aria-label="GemLink introduction and featured gemstone photos"
      aria-roledescription="carousel"
    >
      <div className="slider-images" aria-hidden="true">
        {slides.map((listing, index) => {
          const filename = listing.photos[0].split("/").pop();

          const imageUrl =
            `/api/listings/${listing._id}/public-photos/` +
            encodeURIComponent(filename);

          if (failedImages[imageUrl]) {
            return null;
          }

          return (
            <img
              key={listing._id}
              className={
                index === activeIndex
                  ? "slider-background is-active"
                  : "slider-background"
              }
              src={imageUrl}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              onError={() => markImageFailed(imageUrl)}
            />
          );
        })}
      </div>

      <div className="slider-overlay" />

      <div className="container slider-content">
        <div className="slider-copy">
          <p className="slider-eyebrow">
            DISCOVER · CONNECT · EXPLORE
          </p>

          <h1>
            Your next gemstone.
            <span>Your next discovery.</span>
          </h1>

          <p className="slider-description">
            Explore rough gemstones and gemstone bundles.
            Compare asking prices, view seller photos and
            send a question or offer directly to the seller.
          </p>

          <div className="hero-actions">
            <Link className="gem-button" to="/browse">
              Browse gemstones
              <span aria-hidden="true">↗</span>
            </Link>

            {canSell ? (
              <Link
                className="gem-button slider-secondary"
                to={user ? "/my-listings/new" : "/register"}
              >
                Sell gemstones
              </Link>
            ) : (
              <Link
                className="gem-button slider-secondary"
                to="/about"
              >
                About GemLink
              </Link>
            )}
          </div>

          <p className="slider-note">
            Browse without an account. Contact sellers through
            inquiries. No online checkout.
          </p>
        </div>
      </div>

      <div className="container slider-bottom">
        <div
          className="slider-caption"
          aria-live="polite"
          aria-atomic="true"
        >
          {activeListing ? (
            <>
              <span>
                {failedImages[
                  `/api/listings/${activeListing._id}/public-photos/` +
                  encodeURIComponent(
                    activeListing.photos[0].split("/").pop()
                  )
                ]
                  ? "PHOTO UNAVAILABLE"
                  : "SELLER-LISTED GEMSTONE"}
              </span>

              <Link to={`/listings/${activeListing._id}`}>
                {activeListing.title} ↗
              </Link>

              <small>
                {activeIndex + 1} of {slides.length} ·{" "}
                {activeListing.location}
              </small>
            </>
          ) : (
            <>
              <span>WELCOME TO GEMLINK</span>
              <strong>
                {loading
                  ? "Loading gemstone photos..."
                  : "A place for buyers and gemstone sellers."}
              </strong>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="slider-controls">
            <button
              type="button"
              className="slider-arrow"
              onClick={previousSlide}
              aria-label="Previous gemstone photo"
            >
              ←
            </button>

            <div
              className="slider-dots"
              aria-label="Choose a gemstone photo"
            >
              {slides.map((listing, index) => (
                <button
                  key={listing._id}
                  type="button"
                  className={
                    index === activeIndex
                      ? "slider-dot is-active"
                      : "slider-dot"
                  }
                  aria-label={`Show photo ${index + 1}: ${listing.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => setPosition(index)}
                />
              ))}
            </div>

            <button
              type="button"
              className="slider-arrow"
              onClick={nextSlide}
              aria-label="Next gemstone photo"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSlider;