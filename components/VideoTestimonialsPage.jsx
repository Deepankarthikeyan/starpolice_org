import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderPause } from "../lib/useAutoSlider";

function youtubeEmbedUrl(videoId, autoplay = false) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  if (autoplay) {
    params.set("autoplay", "1");
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function testimonialThumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function VideoThumbFrame({ videoId, className, alt }) {
  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{ backgroundImage: `url("${testimonialThumbnailUrl(videoId)}")` }}
    />
  );
}

function VideoLightbox({ videoId, title, index, total, onClose, onPrevious, onNext }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        onPrevious();
      }
      if (event.key === "ArrowRight") {
        onNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="star-vt-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Video testimonial: ${title}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="star-vt-lightbox__nav star-vt-lightbox__nav--prev"
        aria-label="Previous video"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
      >
        ‹
      </button>
      <div className="star-vt-lightbox__panel" onClick={(event) => event.stopPropagation()}>
        <button
          className="star-vt-lightbox__close"
          type="button"
          aria-label="Close video"
          onClick={onClose}
        >
          ×
        </button>
        <div className="star-vt-lightbox__player">
          <iframe
            title={title}
            src={youtubeEmbedUrl(videoId, true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="star-vt-lightbox__caption">
          <span className="star-vt-lightbox__counter">{index + 1} / {total}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <button
        type="button"
        className="star-vt-lightbox__nav star-vt-lightbox__nav--next"
        aria-label="Next video"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
      >
        ›
      </button>
    </div>,
    document.body,
  );
}

export default function VideoTestimonialsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { isPaused, pauseProps } = useAutoSliderPause();
  const total = videoTestimonials.length;
  const activeItem = videoTestimonials[activeIndex];

  const goTo = (index) => {
    setActiveIndex((index + total) % total);
  };

  const openLightbox = (index) => {
    setActiveIndex(index);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  useEffect(() => {
    if (isPaused || lightboxIndex !== null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, lightboxIndex, total]);

  const lightboxItem = lightboxIndex !== null ? videoTestimonials[lightboxIndex] : null;

  return (
    <>
      <section className="star-vt-page pt---80 pb---120">
        <div className="container">
          <div className="star-vt-intro text-center">
            <h2 className="spa-section-title">Hear from our achievers</h2>
            <p className="spa-section-text">
              Browse with the arrows, then tap the full image to watch the video.
            </p>
          </div>

          <div className="star-vt-feature" {...pauseProps}>
            <button
              type="button"
              className="star-vt-feature__arrow star-vt-feature__arrow--prev"
              aria-label="Previous story"
              onClick={() => goTo(activeIndex - 1)}
            >
              ‹
            </button>

            <div className="star-vt-feature__main">
              <button
                type="button"
                className="star-vt-feature__hit"
                aria-label={`Play ${activeItem.title}`}
                onClick={() => openLightbox(activeIndex)}
              >
                <VideoThumbFrame
                  key={activeItem.id}
                  videoId={activeItem.id}
                  className="star-vt-feature__media"
                  alt={activeItem.title}
                />
                <span className="star-vt-feature__play material-symbols-outlined" aria-hidden="true">
                  play_circle
                </span>
              </button>
              <p className="star-vt-feature__label">
                <span>{activeIndex + 1} / {total}</span>
                {activeItem.title}
              </p>
            </div>

            <button
              type="button"
              className="star-vt-feature__arrow star-vt-feature__arrow--next"
              aria-label="Next story"
              onClick={() => goTo(activeIndex + 1)}
            >
              ›
            </button>
          </div>

          <div className="star-vt-all-head text-center">
            <h3>All student video testimonials</h3>
          </div>

          <ul className="star-vt-all-grid">
            {videoTestimonials.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`star-vt-all-card${index === activeIndex ? " is-current" : ""}`}
                  onClick={() => openLightbox(index)}
                >
                  <span className="star-vt-all-card__media">
                    <VideoThumbFrame
                      videoId={item.id}
                      className="star-vt-all-card__thumb"
                      alt={item.title}
                    />
                    <span className="star-vt-all-card__play material-symbols-outlined" aria-hidden="true">
                      play_circle
                    </span>
                  </span>
                  <span className="star-vt-all-card__title">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {lightboxItem && lightboxIndex !== null ? (
        <VideoLightbox
          videoId={lightboxItem.id}
          title={lightboxItem.title}
          index={lightboxIndex}
          total={total}
          onClose={closeLightbox}
          onPrevious={() => {
            const next = (lightboxIndex - 1 + total) % total;
            setLightboxIndex(next);
            setActiveIndex(next);
          }}
          onNext={() => {
            const next = (lightboxIndex + 1) % total;
            setLightboxIndex(next);
            setActiveIndex(next);
          }}
        />
      ) : null}
    </>
  );
}
