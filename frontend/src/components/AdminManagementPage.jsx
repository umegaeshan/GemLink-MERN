import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import AuthContext from "../context/AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PrivateListingPhoto from "./PrivateListingPhoto";

function AdminManagementPage({ type }) {
  const { user, token } = useContext(AuthContext);

  const isUsers = type === "users";
  const isAdmin = user?.role === "admin";
  const filterName = isUsers ? "role" : "status";

  const panelRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [filterInput, setFilterInput] = useState("");
  const [query, setQuery] = useState({
    search: "",
    filter: "",
    page: 1,
  });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!isAdmin || !token) return;

    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");
      setSessionExpired(false);
      setItems([]);
      setSelected(null);

      try {
        const params = new URLSearchParams({
          page: String(query.page),
        });

        if (query.search) params.set("search", query.search);
        if (query.filter) params.set(filterName, query.filter);

        const response = await fetch(
          `/api/admin/management/${type}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            setSessionExpired(true);
          }
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load records.");
        }

        const results = isUsers ? data.users : data.listings;

        if (!Array.isArray(results)) {
          throw new Error("The server returned invalid data.");
        }

        if (!controller.signal.aborted) {
          setItems(results);
          setTotal(data.total);
          setTotalPages(data.totalPages);

          if (results.length === 0 && query.page > 1) {
            setQuery((current) => ({
              ...current,
              page: Math.max(1, data.totalPages),
            }));
          }
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

    loadData();
    return () => controller.abort();
  }, [
    type,
    isUsers,
    isAdmin,
    token,
    filterName,
    query,
    retryCount,
  ]);

  useEffect(() => {
    if (selected) {
      panelRef.current?.focus();
      panelRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [selected, mode]);

  function applyFilters(event) {
    event.preventDefault();
    if (busy) return;

    setQuery({
      search: searchInput.trim(),
      filter: filterInput,
      page: 1,
    });
  }

  function clearFilters() {
    setSearchInput("");
    setFilterInput("");
    setQuery({ search: "", filter: "", page: 1 });
  }

  function openAction(item, action) {
    setSelected(item);
    setMode(action);
    setNewValue(isUsers ? item.role : item.status);
    setReason(item.rejectionReason || "");
    setActionError("");
    setMessage("");
  }

  async function submitAction(event) {
    event.preventDefault();

    if (!selected || busy) return;

    setBusy(true);
    setActionError("");

    try {
      const deleting = mode === "delete";
      const suffix = deleting ? "" : isUsers ? "/role" : "/status";

      const body = isUsers
        ? { role: newValue }
        : {
            status: newValue,
            rejectionReason: newValue === "rejected" ? reason.trim() : "",
          };

      const response = await fetch(
        `/api/admin/management/${type}/${selected._id}${suffix}`,
        {
          method: deleting ? "DELETE" : "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(deleting ? {} : { "Content-Type": "application/json" }),
          },
          ...(deleting ? {} : { body: JSON.stringify(body) }),
        }
      );

      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to complete this action.");
      }

      setMessage(data.message || "Changes saved.");
      setSelected(null);
      setRetryCount((count) => count + 1);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="container admin-management-page">
        <div className="admin-page-heading">
          <p className="eyebrow">ADMIN DASHBOARD</p>
          <h1>{isUsers ? "User management" : "Stone management"}</h1>
          <p>
            {isUsers
              ? "Search accounts, change roles and manage users."
              : "Review gemstone details, change status and manage listings."}
          </p>
        </div>

        {!user || !token ? (
          <div className="state-box">
            <p>Please log in with an admin account.</p>
            <Link className="gem-button" to="/login">Go to login</Link>
          </div>
        ) : !isAdmin ? (
          <p className="state-box" role="alert">
            This page is available to admins only.
          </p>
        ) : sessionExpired ? (
          <div className="state-box" role="alert">
            <p>Your session has expired. Please log in again.</p>
            <Link className="gem-button" to="/login">Log in again</Link>
          </div>
        ) : (
          <>
            <form className="admin-filter-form" onSubmit={applyFilters}>
              <label>
                {isUsers ? "Search users" : "Search listings"}
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  maxLength={120}
                  placeholder={isUsers ? "Name or email" : "Listing title"}
                  disabled={busy}
                />
              </label>

              <label>
                {isUsers ? "Account role" : "Listing status"}
                <select
                  value={filterInput}
                  onChange={(event) => setFilterInput(event.target.value)}
                  disabled={busy}
                >
                  <option value="">{isUsers ? "All roles" : "All statuses"}</option>

                  {(isUsers
                    ? ["buyer", "seller", "admin"]
                    : ["pending", "approved", "rejected"]
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" disabled={busy}>Search</button>
              <button
                type="button"
                className="secondary-button"
                onClick={clearFilters}
                disabled={busy}
              >
                Clear
              </button>
            </form>

            {message && (
              <p className="admin-feedback" role="status">{message}</p>
            )}

            {selected && (
              <section
                className={`admin-action-panel ${mode === "delete" ? "is-danger" : ""}`}
                ref={panelRef}
                tabIndex={-1}
                aria-labelledby="admin-action-title"
              >
                <div className="admin-panel-heading">
                  <div>
                    <h2 id="admin-action-title">
                      {mode === "delete"
                        ? "Confirm deletion"
                        : mode === "view"
                          ? "Listing details"
                          : isUsers
                            ? "Change user role"
                            : "Change listing status"}
                    </h2>
                    <p>{isUsers ? selected.name : selected.title}</p>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setSelected(null)}
                    disabled={busy}
                  >
                    Close
                  </button>
                </div>

                {mode === "view" ? (
                  <>
                    <dl className="detail-facts">
                      <div>
                        <dt>Seller</dt>
                        <dd>{selected.seller?.name || "Account unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Seller email</dt>
                        <dd>{selected.seller?.email || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Gem type (seller-provided)</dt>
                        <dd>{selected.gemType || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt>Weight / stones</dt>
                        <dd>{selected.weightCarats} ct / {selected.stoneCount}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{selected.location}</dd>
                      </div>
                    </dl>

                    <p className="inquiry-text">{selected.description}</p>

                    {(selected.photos || []).length > 0 ? (
                      <div className="seller-photo-grid">
                        {selected.photos.map((photoPath, index) => (
                          <PrivateListingPhoto
                            key={photoPath}
                            listingId={selected._id}
                            photoPath={photoPath}
                            token={token}
                            alt={`${selected.title}, photo ${index + 1}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="inquiry-note">No photos uploaded.</p>
                    )}

                    {selected.rejectionReason && (
                      <p className="inquiry-text">
                        <strong>Rejection reason: </strong>
                        {selected.rejectionReason}
                      </p>
                    )}

                    {selected.status === "approved" && (
                      <Link
                        className="seller-action seller-action-outline"
                        to={`/listings/${selected._id}`}
                      >
                        View public listing ↗
                      </Link>
                    )}
                  </>
                ) : (
                  <form className="admin-edit-form" onSubmit={submitAction}>
                    {mode === "delete" ? (
                      <p>
                        {isUsers
                          ? `Permanently delete ${selected.email}? This cannot be undone. Users with listings or inquiries cannot be deleted.`
                          : "Permanently delete this listing and its photos? This cannot be undone. Listings with inquiries cannot be deleted."}
                      </p>
                    ) : (
                      <>
                        <label>
                          {isUsers ? "New role" : "New status"}
                          <select
                            value={newValue}
                            onChange={(event) => setNewValue(event.target.value)}
                            disabled={busy}
                          >
                            {(isUsers
                              ? ["buyer", "seller", "admin"]
                              : ["pending", "approved", "rejected"]
                            ).map((value) => (
                              <option key={value} value={value}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                              </option>
                            ))}
                          </select>
                        </label>

                        {isUsers && newValue === "admin" && (
                          <p className="inquiry-note">
                            Admin access allows this user to manage accounts,
                            listings and approvals.
                          </p>
                        )}

                        {!isUsers && newValue === "rejected" && (
                          <label>
                            Rejection reason
                            <textarea
                              value={reason}
                              onChange={(event) => setReason(event.target.value)}
                              minLength={5}
                              maxLength={500}
                              rows={3}
                              required
                              disabled={busy}
                            />
                          </label>
                        )}

                        {!isUsers && (
                          <p className="inquiry-note">
                            Only approved listings appear in public browsing.
                            Approval does not certify authenticity.
                          </p>
                        )}
                      </>
                    )}

                    {actionError && (
                      <p className="admin-error" role="alert">{actionError}</p>
                    )}

                    <div className="admin-panel-actions">
                      <button
                        type="submit"
                        className={mode === "delete" ? "admin-delete-confirm" : ""}
                        disabled={busy}
                      >
                        {busy
                          ? "Please wait..."
                          : mode === "delete"
                            ? "Delete permanently"
                            : "Save changes"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setSelected(null)}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {loading ? (
              <p className="state-box" role="status">Loading records...</p>
            ) : error ? (
              <div className="state-box" role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="section-heading admin-results-heading">
                  <h2>{total} {isUsers ? "users" : "listings"}</h2>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={busy}
                    onClick={() => setRetryCount((count) => count + 1)}
                  >
                    Refresh
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="state-box">No matching records found.</p>
                ) : (
                  <div
                    className="admin-table-wrap"
                    role="region"
                    aria-label={isUsers ? "Users table" : "Listings table"}
                    tabIndex={0}
                  >
                    <table className="admin-table">
                      <caption className="admin-visually-hidden">
                        {isUsers ? "Registered users" : "Gemstone listings"}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">{isUsers ? "User" : "Listing"}</th>
                          <th scope="col">{isUsers ? "Email" : "Seller"}</th>
                          {!isUsers && <th scope="col">Price</th>}
                          <th scope="col">{isUsers ? "Role" : "Status"}</th>
                          <th scope="col">Created</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item) => {
                          const isSelf = isUsers && item._id === currentUserId;

                          return (
                            <tr key={item._id}>
                              <td className="admin-record-name">
                                <strong>{isUsers ? item.name : item.title}</strong>
                                {isSelf && <small>Your account</small>}
                                {!isUsers && (
                                  <small>
                                    {item.listingType === "lot" ? "Gem lot" : "Single stone"}
                                    {" · "}{item.location}
                                  </small>
                                )}
                              </td>

                              <td>
                                {isUsers
                                  ? item.email
                                  : item.seller?.name || "Account unavailable"}
                              </td>

                              {!isUsers && (
                                <td className="admin-price-cell">
                                  LKR {item.askingPrice.toLocaleString("en-LK")}
                                </td>
                              )}

                              <td>
                                <span
                                  className={
                                    isUsers
                                      ? "admin-role-badge"
                                      : `status-badge ${item.status}`
                                  }
                                >
                                  {isUsers ? item.role : item.status}
                                </span>
                              </td>

                              <td className="admin-date-cell">
                                {new Date(item.createdAt).toLocaleDateString("en-LK")}
                              </td>

                              <td>
                                <div className="admin-row-actions">
                                  {!isUsers && (
                                    <button
                                      type="button"
                                      className="admin-table-button"
                                      disabled={busy}
                                      onClick={() => openAction(item, "view")}
                                      aria-label={`View ${item.title}`}
                                    >
                                      View
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className="admin-table-button"
                                    disabled={busy || isSelf}
                                    onClick={() => openAction(item, "edit")}
                                    aria-label={`Change ${isUsers ? "role for" : "status of"} ${isUsers ? item.name : item.title}`}
                                  >
                                    {isUsers ? "Role" : "Status"}
                                  </button>

                                  <button
                                    type="button"
                                    className="admin-table-button admin-table-delete"
                                    disabled={busy || isSelf}
                                    onClick={() => openAction(item, "delete")}
                                    aria-label={`Delete ${isUsers ? item.name : item.title}`}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {(totalPages > 1 || query.page > 1) && (
                  <nav className="pagination" aria-label="Results pages">
                    <button
                      type="button"
                      disabled={busy || query.page <= 1}
                      onClick={() =>
                        setQuery((current) => ({
                          ...current,
                          page: current.page - 1,
                        }))
                      }
                    >
                      Previous
                    </button>

                    <span>
                      Page {query.page} of {Math.max(totalPages, 1)}
                    </span>

                    <button
                      type="button"
                      disabled={busy || query.page >= totalPages}
                      onClick={() =>
                        setQuery((current) => ({
                          ...current,
                          page: current.page + 1,
                        }))
                      }
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

export default AdminManagementPage;