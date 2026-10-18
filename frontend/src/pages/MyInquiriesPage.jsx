import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";

function MyInquiriesPage() {
  const { user, token } = useContext(AuthContext);

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isBuyer = user?.role === "buyer";

  useEffect(() => {
    if (!isBuyer || !token) {
      return;
    }

    const controller = new AbortController();

    async function loadInquiries() {
      setLoading(true);
      setError("");
      setSessionExpired(false);
      setInquiries([]);

      try {
        const response = await fetch("/api/inquiries/mine", {
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
          throw new Error(data.message || "Unable to load inquiries.");
        }

        if (!controller.signal.aborted) {
          setInquiries(data.inquiries);
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

    loadInquiries();

    return () => controller.abort();
  }, [token, isBuyer, retryCount]);

  return (
    <>
      <SiteHeader />

      <main className="container inquiries-page">
        <h1>My inquiries</h1>
        <p>View your messages, offers and seller responses.</p>

        {!user || !token ? (
          <div className="state-box">
            <p>Please log in with a buyer account.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : !isBuyer ? (
          <p className="state-box">
            This page is available to buyer accounts only.
          </p>
        ) : sessionExpired ? (
          <div className="state-box" role="alert">
            <p>Your session has expired. Please log in again.</p>
            <Link to="/login">Go to login</Link>
          </div>
        ) : loading ? (
          <p className="state-box" role="status">
            Loading inquiries...
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
        ) : inquiries.length === 0 ? (
          <div className="state-box">
            <p>You have not sent any inquiries yet.</p>
            <Link to="/">Browse listings</Link>
          </div>
        ) : (
          <div className="inquiries-list">
            {inquiries.map((inquiry) => (
              <article className="inquiry-card" key={inquiry._id}>
                <div className="inquiry-heading">
                  <h2>
                    {inquiry.listing
                      ? inquiry.listing.title
                      : "Listing no longer available"}
                  </h2>

                  <span className={`status-badge ${inquiry.status}`}>
                    {inquiry.status}
                  </span>
                </div>

                <p className="inquiry-date">
                  {new Date(inquiry.createdAt).toLocaleString("en-LK")}
                </p>

                <h3>Your message</h3>
                <p className="inquiry-text">{inquiry.message}</p>

                {inquiry.offerPrice != null && (
                  <p>
                    <strong>Your offer: </strong>
                    LKR {inquiry.offerPrice.toLocaleString("en-LK")}
                  </p>
                )}

                <div className="seller-response">
                  <h3>Seller reply</h3>

                  <p className="inquiry-text">
                    {inquiry.sellerReply ||
                      "The seller has not replied yet."}
                  </p>
                </div>

                {inquiry.listing && (
                  <Link
                    className="details-link"
                    to={`/listings/${inquiry.listing._id}`}
                  >
                    View listing
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}

        <p className="inquiry-note">
          An accepted inquiry or offer does not confirm payment
          or a completed purchase.
        </p>
      </main>
    </>
  );
}

export default MyInquiriesPage;