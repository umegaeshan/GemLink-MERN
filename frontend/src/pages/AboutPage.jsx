import { Link } from "react-router";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="container information-page">
        <section className="information-intro">
          <p className="eyebrow">ABOUT GEMLINK</p>
          <h1>Bringing discovery and conversation together.</h1>
          <p>
            GemLink is a marketplace for exploring rough gemstones
            and connecting buyers with sellers. It brings listing
            details, photos and inquiries into one place.
          </p>
        </section>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h2>For buyers</h2>
            <p>
              Browse individual stones and gem lots, filter by
              your preferences and ask sellers for more information.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <h2>For sellers</h2>
            <p>
              Create listings, upload photos, update your details
              and respond to inquiries through your dashboard.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <h2>Listing moderation</h2>
            <p>
              New listings and listing changes go through moderation
              before they appear publicly. Approval is not gemstone
              authentication or a valuation.
            </p>
          </article>
        </div>

        <section className="information-panel">
          <h2>Make informed decisions.</h2>
          <p>
            A photo or seller description alone cannot establish a
            gemstone’s identity, treatment history or value. Ask
            questions and seek appropriate independent verification
            before agreeing to a transaction.
          </p>
          <p>
            An accepted inquiry is a seller response, not a completed
            purchase. Online payment and delivery are not currently
            handled by GemLink.
          </p>
          <Link className="gem-button" to="/browse">
            Explore the marketplace ↗
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

export default AboutPage;