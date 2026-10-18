import { useState } from "react";

const emptyFilters = {
  search: "",
  listingType: "",
  location: "",
  minPrice: "",
  maxPrice: "",
};

function ListingFilters({ initialFilters = {}, onApply }) {
  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    ...initialFilters,
  }));

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

    const pricePattern = /^[0-9]+([.][0-9]{1,2})?$/;

    for (const price of [filters.minPrice, filters.maxPrice]) {
      if (
        price !== "" &&
        (!pricePattern.test(price) ||
          !Number.isFinite(Number(price)) ||
          Number(price) > Number.MAX_SAFE_INTEGER)
      ) {
        setError("Enter a valid price with up to two decimal places.");
        return;
      }
    }

    if (
      filters.minPrice !== "" &&
      filters.maxPrice !== "" &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      setError("Minimum price cannot be higher than maximum price.");
      return;
    }

    setError("");

    onApply({
      ...filters,
      search: filters.search.trim(),
      location: filters.location.trim(),
    });
  }

  function clearFilters() {
    setFilters({ ...emptyFilters });
    setError("");
    onApply({ ...emptyFilters });
  }

  return (
    <form className="filters simple-filters" onSubmit={handleSubmit}>
      <div className="search-row">
        <label className="filter-field">
          What are you looking for?
          <input
            type="search"
            name="search"
            placeholder="Search gemstone titles"
            value={filters.search}
            onChange={handleChange}
            maxLength={120}
          />
        </label>

        <label className="filter-field">
          Show me
          <select
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
          >
            <option value="">All gemstones</option>
            <option value="individual">Single gemstones</option>
            <option value="lot">Gemstone bundles</option>
          </select>
        </label>

        <button type="submit">Search gemstones</button>
      </div>

      <details
        className="extra-filters"
        open={
          Boolean(
            initialFilters.location ||
            initialFilters.minPrice ||
            initialFilters.maxPrice
          ) || undefined
        }
      >
        <summary>More filters: location & price</summary>

        <div className="filter-grid">
          <label className="filter-field">
            Location
            <input
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
              placeholder="Any price"
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
              placeholder="Any price"
              value={filters.maxPrice}
              onChange={handleChange}
            />
          </label>
        </div>

        <button className="apply-extra" type="submit">
          Apply filters
        </button>
      </details>

      {error && (
        <p className="filter-error" role="alert">{error}</p>
      )}

      <button
        className="clear-filters"
        type="button"
        onClick={clearFilters}
      >
        Clear all filters
      </button>
    </form>
  );
}

export default ListingFilters;