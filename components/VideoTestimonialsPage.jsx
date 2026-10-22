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

function mqThumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function VideoThumb({ videoId, alt = "", loading, className = "" }) {
  const [src, setSrc] = useState(() => mqThumbnailUrl(videoId));

  useEffect(() => {
    setSrc(mqThumbnailUrl(videoId));
  }, [videoId]);

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setSrc(mqThumbnailUrl(videoId))}
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
      <section className="star-vt-film pt---80 pb---120">
        <div className="container">
          <header className="star-vt-film__head text-center">
            <p className="star-vt-film__eyebrow">Student success on video</p>
            <h2 className="spa-section-title">Video testimonials</h2>
            <p className="spa-section-text">
              Wide landscape previews — full thumbnail, no crop. Tap any rectangle to play.
            </p>
          </header>

          <div className="star-vt-film-hero" {...pauseProps}>
            <button
              type="button"
              className="star-vt-film-hero__arrow star-vt-film-hero__arrow--prev"
              aria-label="Previous story"
              onClick={() => goTo(activeIndex - 1)}
            >
              ‹
            </button>

            <div className="star-vt-film-hero__stage">
              <button
                type="button"
                className="star-vt-film-hero__hit"
                aria-label={`Play ${activeItem.title}`}
                onClick={() => openLightbox(activeIndex)}
              >
                <VideoThumb
                  key={activeItem.id}
                  videoId={activeItem.id}
                  alt={activeItem.title}
                  className="star-vt-film-img star-vt-film-img--hero"
                />
                <span className="star-vt-film-hero__play material-symbols-outlined" aria-hidden="true">
                  play_circle
                </span>
              </button>
              <p className="star-vt-film-hero__meta">
                <span>{activeIndex + 1} / {total}</span>
                {activeItem.title}
              </p>
            </div>

            <button
              type="button"
              className="star-vt-film-hero__arrow star-vt-film-hero__arrow--next"
              aria-label="Next story"
              onClick={() => goTo(activeIndex + 1)}
            >
              ›
            </button>
          </div>

          <ul className="star-vt-film-grid">
            {videoTestimonials.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`star-vt-film-card${index === activeIndex ? " is-active" : ""}`}
                  aria-label={`Play ${item.title}`}
                  onClick={() => openLightbox(index)}
                >
                  <span className="star-vt-film-card__frame">
                    <VideoThumb
                      videoId={item.id}
                      alt={item.title}
                      className="star-vt-film-img"
                      loading="lazy"
                    />
                    <span className="star-vt-film-card__play material-symbols-outlined" aria-hidden="true">
                      play_circle
                    </span>
                  </span>
                  <span className="star-vt-film-card__label">{item.title}</span>
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
