import { BrowserRouter, Routes, Route, Link } from "react-router";
import AuthProvider from "./context/AuthProvider";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailsPage from "./pages/ListingDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyInquiriesPage from "./pages/MyInquiriesPage";
import ReceivedInquiriesPage from "./pages/ReceivedInquiriesPage";
import MyListingsPage from "./pages/MyListingsPage";
import CreateListingPage from "./pages/CreateListingPage";
import EditListingPage from "./pages/EditListingPage";
import AdminListingsPage from "./pages/AdminListingsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminStonesPage from "./pages/AdminStonesPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<ListingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/listings/:id" element={<ListingDetailsPage />} />

          <Route path="/my-inquiries" element={<MyInquiriesPage />} />
          <Route
            path="/received-inquiries"
            element={<ReceivedInquiriesPage />}
          />

          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/my-listings/new" element={<CreateListingPage />} />
          <Route
            path="/my-listings/:id/edit"
            element={<EditListingPage />}
          />

          <Route path="/admin/listings" element={<AdminListingsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/stones" element={<AdminStonesPage />} />

          <Route
            path="*"
            element={
              <main className="container information-page">
                <h1>Page not found</h1>
                <Link className="gem-button" to="/">
                  Back to home
                </Link>
              </main>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;