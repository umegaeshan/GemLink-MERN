import { useState } from "react";
import { Link } from "react-router";

function GemstoneCard({ listing }) {
  const [failedImage, setFailedImage] = useState("");
  const filename = listing.photos?.[0]?.split("/").pop();

  const imageUrl = filename
    ? `/api/listings/${listing._id}/public-photos/${encodeURIComponent(filename)}`
    : "";

  return (
    <article className="gem-card">
      <div className="gem-card-image">
        {imageUrl && failedImage !== imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            onError={() => setFailedImage(imageUrl)}
          />
        ) : (
          <div className="gem-card-placeholder">
            <span aria-hidden="true">◇</span>
            <p>Photo unavailable</p>
          </div>
        )}

        <span className="gem-card-type">
          {listing.listingType === "lot"
            ? "Gemstone bundle"
            : "Single gemstone"}
        </span>
      </div>

      <div className="gem-card-body">
        <p className="gem-card-location">{listing.location}</p>
        <h3>{listing.title}</h3>

        <p className="gem-card-facts">
          {listing.weightCarats} carats · {listing.stoneCount}{" "}
          {listing.stoneCount === 1 ? "stone" : "stones"}
        </p>

        <div className="gem-card-price">
          <span>Asking price</span>
          <strong>
            LKR {listing.askingPrice.toLocaleString("en-LK")}
          </strong>
        </div>

        <Link
          className="gem-card-link"
          to={`/listings/${listing._id}`}
          aria-label={`View gemstone: ${listing.title}`}
        >
          View gemstone <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

export default GemstoneCard;