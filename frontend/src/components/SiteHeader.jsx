import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";

function SiteHeader() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link className="brand" to="/">
          GemLink
        </Link>

        <nav className="header-actions" aria-label="Main navigation">
          {user ? (
            <>
              <span className="user-label">
                {user.name} · {user.role}
              </span>

              {user.role === "buyer" && (
                <Link className="header-login" to="/my-inquiries">
                  My inquiries
                </Link>
              )}

              {user.role === "seller" && (
                <>
                  <Link className="header-login" to="/my-listings">
                    My listings
                  </Link>

                  <Link className="header-login" to="/received-inquiries">
                    Received inquiries
                  </Link>
                </>
              )}

              {user.role === "admin" && (
                <Link className="header-login" to="/admin/listings">
                  Review listings
                </Link>
              )}

              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="header-login" to="/login">
                Log in
              </Link>

              <Link className="header-login" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;