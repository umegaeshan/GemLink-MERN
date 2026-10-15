import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";

function InquiryReplyForm({ inquiryId, token, onSaved, onExpired }) {
  const [status, setStatus] = useState("accepted");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const cleanReply = reply.trim();

    if (cleanReply.length < 5 || cleanReply.length > 1000) {
      setError("Reply must contain between 5 and 1000 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/inquiries/${inquiryId}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            sellerReply: cleanReply,
          }),
        }
      );

      if (response.status === 401) {
        onExpired();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to save reply.");
        return;
      }

      onSaved(data.inquiry);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <label className="filter-field">
        Decision
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={loading}
        >
          <option value="accepted">Accept</option>
          <option value="rejected">Reject</option>
        </select>
      </label>

      <label className="filter-field">
        Your reply
        <textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          minLength={5}
          maxLength={1000}
          rows={4}
          disabled={loading}
          required
        />
      </label>

      <p className="inquiry-note">
        Once submitted, this decision cannot be changed here.
      </p>

      {error && (
        <p className="filter-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Submit response"}
      </button>
    </form>
  );
}

function ReceivedInquiriesPage() {
  const { user, token } = useContext(AuthContext);

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [success, setSuccess] = useState("");

  const isSeller = user?.role === "seller";

  useEffect(() => {
    if (!isSeller || !token) {
      return;
    }

    const controller = new AbortController();

    async function loadInquiries() {
      setLoading(true);
      setError("");
      setSuccess("");
      setSessionExpired(false);
      setInquiries([]);

      try {
        const response = await fetch("/api/inquiries/received", {
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
            data.message || "Unable to load received inquiries."
          );
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
  }, [token, isSeller, retryCount]);

  function handleSaved(updatedInquiry) {
    setInquiries((current) =>
      current.map((inquiry) =>
        inquiry._id === updatedInquiry._id
          ? {
              ...inquiry,
              status: updatedInquiry.status,
              sellerReply: updatedInquiry.sellerReply,
              updatedAt: updatedInquiry.updatedAt,
            }
          : inquiry
      )
    );

    setSuccess("Your response was saved.");
  }

  return (
    <>
      <SiteHeader />

      <main className="container inquiries-page">
        <h1>Received inquiries</h1>
        <p>Read buyer messages and respond to their offers.</p>

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
        ) : (
          <>
            {success && (
              <p className="success-message" role="status">
                {success}
              </p>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Reload inquiries
            </button>

            {inquiries.length === 0 ? (
              <p className="state-box">
                You have not received any inquiries yet.
              </p>
            ) : (
              <div className="inquiries-list">
                {inquiries.map((inquiry) => (
                  <article
                    className="inquiry-card"
                    key={inquiry._id}
                  >
                    <div className="inquiry-heading">
                      <h2>
                        {inquiry.listing?.title ||
                          "Listing no longer available"}
                      </h2>

                      <span
                        className={`status-badge ${inquiry.status}`}
                      >
                        {inquiry.status}
                      </span>
                    </div>

                    <p className="inquiry-date">
                      {new Date(inquiry.createdAt).toLocaleString("en-LK")}
                    </p>

                    <p>
                      <strong>Buyer: </strong>
                      {inquiry.buyer?.name || "Unavailable"}
                    </p>

                    <h3>Buyer message</h3>
                    <p className="inquiry-text">{inquiry.message}</p>

                    {inquiry.offerPrice != null && (
                      <p>
                        <strong>Offered price: </strong>
                        LKR {inquiry.offerPrice.toLocaleString("en-LK")}
                      </p>
                    )}

                    {inquiry.status === "pending" ? (
                      <InquiryReplyForm
                        inquiryId={inquiry._id}
                        token={token}
                        onSaved={handleSaved}
                        onExpired={() => setSessionExpired(true)}
                      />
                    ) : (
                      <div className="seller-response">
                        <h3>Your reply</h3>
                        <p className="inquiry-text">
                          {inquiry.sellerReply}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        <p className="inquiry-note">
          Accepting an inquiry or offer does not confirm payment
          or a completed purchase.
        </p>
      </main>
    </>
  );
}

export default ReceivedInquiriesPage;