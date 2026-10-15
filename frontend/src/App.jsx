import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router";

import ListingsPage from "./pages/ListingsPage";
import ListingDetailsPage from "./pages/ListingDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListingsPage />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;