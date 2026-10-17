import { useContext } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

function ContactPage() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <SiteHeader />

      <main className="container information-page">
        <section className="information-intro">
          <p className="eyebrow">CONTACT & HELP</p>
          <h1>A clearer way to find your next answer.</h1>
          <p>
            Have a question about a gemstone or using GemLink?
            Start with the options below.
          </p>
        </section>

        <div className="category-grid">
          <article className="information-panel">
            <h2>Ask about a gemstone</h2>
            <p>
              Open the listing you are interested in and use its
              inquiry form while signed in as a buyer. Your question
              goes to that listing’s seller.
            </p>
            <Link className="gem-button" to="/browse">
              Find a listing ↗
            </Link>
          </article>

          <article className="information-panel">
            <h2>Follow up on an inquiry</h2>
            <p>
              Buyers can view responses in My inquiries.
              Sellers can manage incoming messages in Received inquiries.
            </p>
            <Link
              className="text-link"
              to={
                !user
                  ? "/login"
                  : user.role === "buyer"
                    ? "/my-inquiries"
                    : user.role === "seller"
                      ? "/received-inquiries"
                      : "/admin/listings"
              }
            >
              {!user ? "Log in to continue ↗" : "Open your dashboard ↗"}
            </Link>
          </article>
        </div>

        <section className="information-panel">
          <h2>Common questions</h2>

          <details className="help-question">
            <summary>Why is my listing not visible?</summary>
            <p>
              Only approved listings appear in the marketplace.
              Check your listing’s status in My listings.
              Editing details or adding photos sends it back for review.
            </p>
          </details>

          <details className="help-question">
            <summary>Does approval mean a gem is authentic?</summary>
            <p>
              No. Details are seller-provided and moderation does not
              certify a gemstone’s identity, value or authenticity.
            </p>
          </details>

          <details className="help-question">
            <summary>Can I pay through GemLink?</summary>
            <p>
              Online checkout is not currently available.
              GemLink supports listings, inquiries and seller responses.
            </p>
          </details>
        </section>

        <p className="inquiry-note">
          Direct platform support messaging is not available yet.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

export default ContactPage;