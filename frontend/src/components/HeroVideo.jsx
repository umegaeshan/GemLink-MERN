import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";

function HeroVideo() {
  const { user } = useContext(AuthContext);
  const videoRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const canSell = !user || user.role === "seller";

  useEffect(() => {
    const video = videoRef.current;
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (!video) return;

    // Respect reduced-motion settings.
    if (!motionPreference.matches) {
      video.play().catch(() => {
        // If autoplay is blocked, the Play button remains available.
      });
    }

    function handleMotionChange(event) {
      if (event.matches) {
        video.pause();
      }
    }

    motionPreference.addEventListener("change", handleMotionChange);

    return () => {
      motionPreference.removeEventListener(
        "change",
        handleMotionChange
      );
      video.pause();
    };
  }, []);

  async function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // Keep the poster visible if playback is unavailable.
      }
    } else {
      video.pause();
    }
  }

  return (
    <section className="video-hero" aria-label="Welcome to GemLink">
      <div className="video-hero-media" aria-hidden="true">
        {!videoFailed && (
          <video
            ref={videoRef}
            className="video-hero-background"
            poster="/images/gemstones-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setVideoFailed(true)}
            src="/videos/gemstones.mp4"
          />
        )}
      </div>

      <div className="video-hero-overlay" />

      <div className="container video-hero-content">
        <div className="video-hero-copy">
          <p className="video-eyebrow">
            DISCOVER THE WORLD OF ROUGH GEMSTONES
          </p>

          <h1>
            Find your next gemstone.
            <span>Connect with its seller.</span>
          </h1>

          <p className="video-hero-description">
            Explore gemstone photos, compare asking prices and
            ask sellers questions before you make a decision.
          </p>

          <div className="hero-actions">
            <Link className="gem-button" to="/browse">
              Browse gemstones ↗
            </Link>

            {canSell && (
              <Link
                className="gem-button video-secondary"
                to={user ? "/my-listings/new" : "/register"}
              >
                Sell gemstones
              </Link>
            )}
          </div>

          <p className="video-hero-note">
            Browse freely. Create an account to send inquiries.
          </p>
        </div>
      </div>

      <div className="container video-hero-bottom">
        <span>Discover. Ask. Connect.</span>

        {!videoFailed && (
          <button
            type="button"
            className="video-play-button"
            onClick={toggleVideo}
            aria-label={
              playing
                ? "Pause background video"
                : "Play background video"
            }
          >
            {playing ? "Pause video Ⅱ" : "Play video ▷"}
          </button>
        )}
      </div>
    </section>
  );
}

export default HeroVideo;