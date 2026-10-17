import { useState } from "react";
import { useNavigate } from "react-router";

function NavbarSearch({ onSearch }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    const searchText = search.trim();

    const params = new URLSearchParams();

    if (searchText) {
      params.set("search", searchText);
    }

    const queryString = params.toString();

    navigate(queryString ? `/browse?${queryString}` : "/browse");

    onSearch?.();
  }

  return (
    <form
      className="navbar-search"
      role="search"
      aria-label="Search public gemstones"
      onSubmit={handleSubmit}
    >
      <input
        type="search"
        name="search"
        aria-label="Search gemstone listings"
        placeholder="Search gemstones..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        maxLength={120}
      />

      <button
        type="submit"
        aria-label="Search gemstones"
        title="Search gemstones"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      </button>
    </form>
  );
}

export default NavbarSearch;