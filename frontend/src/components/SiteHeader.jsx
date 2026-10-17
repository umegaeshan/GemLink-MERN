import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";

function SiteHeader() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuButtonRef = useRef(null);
  const accountRef = useRef(null);

  const navigate = useNavigate();
  const canSell = !user || user.role === "seller";

  useEffect(() => {
    function handleOutsideClick(event) {
      const account = accountRef.current;

      if (account && !account.contains(event.target)) {
        account.open = false;
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  function closeMenus() {
    setMenuOpen(false);

    if (accountRef.current) {
      accountRef.current.open = false;
    }
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate("/");
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;

    if (accountRef.current?.open) {
      accountRef.current.open = false;
      accountRef.current.querySelector("summary")?.focus();
      return;
    }

    if (menuOpen) {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  }

  return (
    <header
      className="site-header logo-header"
      onKeyDown={handleKeyDown}
    >
      <div className="container header-content">
        <Link
          className="brand"
          to="/"
          onClick={closeMenus}
          aria-label="GemLink home"
        >
          <img
            className="brand-logo"
            src="/images/gemlink-logo.png"
            alt=""
            width="48"
            height="48"
          />

          <span>
            GemLink<span className="brand-dot">.</span>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? "Close ✕" : "Menu ☰"}
        </button>

        <nav
          id="main-navigation"
          className={`main-navigation ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="public-navigation">
            <NavLink to="/" end onClick={closeMenus}>
              Home
            </NavLink>

            <NavLink to="/browse" onClick={closeMenus}>
              Browse gemstones
            </NavLink>

            <Link to="/#how-it-works" onClick={closeMenus}>
              How it works
            </Link>

            <NavLink to="/about" onClick={closeMenus}>
              About us
            </NavLink>

            <NavLink to="/contact" onClick={closeMenus}>
              Contact us
            </NavLink>
          </div>

          <div className="account-navigation">
            {!user ? (
              <Link to="/login" onClick={closeMenus}>
                Log in
              </Link>
            ) : (
              <details className="account-menu" ref={accountRef}>
                <summary>
                  <span className="account-avatar" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      focusable="false"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </svg>
                  </span>

                  <span>My account</span>

                  <svg
                    className="account-chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>

                <div className="account-dropdown">
                  <p className="account-heading">
                    <strong>{user.name}</strong>
                    <span>{user.role} account</span>
                  </p>

                  {user.role === "buyer" && (
                    <Link to="/my-inquiries" onClick={closeMenus}>
                      My messages
                    </Link>
                  )}

                  {user.role === "seller" && (
                    <>
                      <Link to="/my-listings" onClick={closeMenus}>
                        My listings
                      </Link>

                      <Link to="/my-listings/new" onClick={closeMenus}>
                        Add a gemstone
                      </Link>

                      <Link
                        to="/received-inquiries"
                        onClick={closeMenus}
                      >
                        Buyer messages
                      </Link>
                    </>
                  )}

                  {user.role === "admin" && (
                    <Link to="/admin/listings" onClick={closeMenus}>
                      Review submissions
                    </Link>
                  )}

                  <Link to="/contact" onClick={closeMenus}>
                    Help
                  </Link>

                  <button type="button" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </details>
            )}

            {canSell && (
              <Link
                className="nav-cta"
                to={user ? "/my-listings/new" : "/register"}
                onClick={closeMenus}
              >
                Sell gemstones ↗
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;