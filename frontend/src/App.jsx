import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router";

import AuthProvider from "./context/AuthProvider";
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



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListingsPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/listings/:id"
            element={<ListingDetailsPage />}
          />

          <Route
            path="*"
            element={
              <main className="container details-page">
                <h1>Page not found</h1>
                <Link to="/">Back to listings</Link>
              </main>
            }
          />

          <Route
            path="/my-inquiries"
            element={<MyInquiriesPage />}
          />

          <Route
            path="/received-inquiries"
            element={<ReceivedInquiriesPage />}
          />

          <Route
            path="/my-listings"
            element={<MyListingsPage />}
          />

          <Route
            path="/my-listings/:id/edit"
            element={<EditListingPage />}
          />

          <Route
            path="/my-listings/new"
            element={<CreateListingPage />}
          />

          <Route
  path="/admin/listings"
  element={<AdminListingsPage />}
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;