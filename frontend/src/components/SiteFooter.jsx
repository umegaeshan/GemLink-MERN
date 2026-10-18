import { Link } from "react-router";

const currentYear = new Date().getFullYear();

function SiteFooter() {
  return (
    <footer className="gem-footer">
      <div className="container footer-grid">
        <div>
          <Link
            className="brand"
            to="/"
            aria-label="GemLink home"
          >
            <img
              className="brand-logo"
              src="/images/gemlink-logo.png"
              alt=""
              width="48"
              height="48"
              loading="lazy"
            />

            <span>
              GemLink<span className="brand-dot">.</span>
            </span>
          </Link>

          <p>
            Discover rough gemstones, compare seller listings
            and connect with sellers before you decide.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2>Explore GemLink</h2>
          <Link to="/">Home</Link>
          <Link to="/browse">Browse gemstones</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/register">Create an account</Link>
        </nav>

        <div>
          <h2>Before you make an offer</h2>

          <p>
            Gem details are seller-provided. Listing approval
            does not certify authenticity. GemLink does not
            process payments or delivery.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {currentYear} GemLink</span>
        <span>Discover. Ask. Connect.</span>
      </div>
    </footer>
  );
}

export default SiteFooter;