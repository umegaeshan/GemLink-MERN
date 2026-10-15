import { useState } from "react";

const emptyFilters = {
  search: "",
  listingType: "",
  location: "",
  minPrice: "",
  maxPrice: "",
};

function ListingFilters({ onApply }) {
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      filters.minPrice !== "" &&
      filters.maxPrice !== "" &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      setError("Minimum price cannot exceed maximum price.");
      return;
    }

    setError("");

    onApply({
      ...filters,
      search: filters.search.trim(),
      location: filters.location.trim(),
    });
  }

  function handleClear() {
    setFilters({ ...emptyFilters });
    setError("");
    onApply({ ...emptyFilters });
  }

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <div className="filter-grid">
        <label className="filter-field">
          Search
          <input
            type="search"
            name="search"
            placeholder="Search listing titles"
            value={filters.search}
            onChange={handleChange}
            maxLength={120}
          />
        </label>

        <label className="filter-field">
          Listing type
          <select
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
          >
            <option value="">All types</option>
            <option value="individual">Individual stone</option>
            <option value="lot">Gem lot</option>
          </select>
        </label>

        <label className="filter-field">
          Location
          <input
            type="text"
            name="location"
            placeholder="e.g. Ratnapura"
            value={filters.location}
            onChange={handleChange}
            maxLength={120}
          />
        </label>

        <label className="filter-field">
          Minimum price (LKR)
          <input
            type="number"
            name="minPrice"
            min="0"
            step="0.01"
            placeholder="Any"
            value={filters.minPrice}
            onChange={handleChange}
          />
        </label>

        <label className="filter-field">
          Maximum price (LKR)
          <input
            type="number"
            name="maxPrice"
            min="0"
            step="0.01"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </label>
      </div>

      {error && (
        <p className="filter-error" role="alert">
          {error}
        </p>
      )}

      <div className="filter-actions">
        <button type="submit">Search listings</button>

        <button
          type="button"
          className="secondary-button"
          onClick={handleClear}
        >
          Clear filters
        </button>
      </div>
    </form>
  );
}

export default ListingFilters;