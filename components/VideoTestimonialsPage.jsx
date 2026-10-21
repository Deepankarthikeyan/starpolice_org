import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderPause } from "../lib/useAutoSlider";

function youtubeThumbnail(videoId, quality = "hqdefault") {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

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

function VideoThumb({ videoId, className, alt = "" }) {
  return (
    <img
      src={youtubeThumbnail(videoId)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        const target = event.currentTarget;
        if (!target.dataset.fallback) {
          target.dataset.fallback = "1";
          target.src = youtubeThumbnail(videoId, "mqdefault");
        }
      }}
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
          <p>Student testimonial — Star Police Academy, Vellore</p>
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
  const active = videoTestimonials[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % total);
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

  const openLightbox = (index) => {
    setActiveIndex(index);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const lightboxItem = lightboxIndex !== null ? videoTestimonials[lightboxIndex] : null;

  return (
    <>
      <section className="star-vt-page pt---100 pb---100">
        <div className="container">
          <header className="star-vt-page__head text-center mb---50">
            <p className="star-vt-page__eyebrow">//Video Testimonials//</p>
            <h1 className="star-vt-page__title">Voices of Our Achievers</h1>
            <p className="star-vt-page__lead">
              Real TNUSRB SI &amp; Police Constable aspirants share their coaching journey at Star Police Academy.
              Every clip is from our official YouTube testimonials.
            </p>
          </header>

          <div className="star-vt-featured" {...pauseProps}>
            <div className="star-vt-featured__header">
              <span className="star-vt-featured__badge">Featured story</span>
              <span className="star-vt-featured__role">{active.title}</span>
            </div>

            <div className="star-vt-featured__stage">
              <button
                type="button"
                className="star-vt-featured__arrow star-vt-featured__arrow--prev"
                aria-label="Previous testimonial"
                onClick={showPrevious}
              >
                ‹
              </button>

              <button
                type="button"
                className="star-vt-featured__frame"
                onClick={() => openLightbox(activeIndex)}
                aria-label={`Play ${active.title}`}
              >
                <VideoThumb videoId={active.id} className="star-vt-featured__thumb" alt={active.title} />
                <span className="star-vt-featured__play" aria-hidden="true">
                  <span className="material-symbols-outlined">play_circle</span>
                </span>
              </button>

              <button
                type="button"
                className="star-vt-featured__arrow star-vt-featured__arrow--next"
                aria-label="Next testimonial"
                onClick={showNext}
              >
                ›
              </button>
            </div>

            <p className="star-vt-featured__hint">
              Story <strong>{activeIndex + 1}</strong> of <strong>{total}</strong> — select play to watch in full screen
            </p>

            <div className="star-vt-featured__dots" role="tablist" aria-label="Choose featured testimonial">
              {videoTestimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={item.title}
                  className={index === activeIndex ? "is-active" : undefined}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="star-vt-gallery__head text-center">
            <h2 className="star-vt-gallery__title">All student testimonials</h2>
            <p className="star-vt-gallery__text">Browse every video story from our academy channel.</p>
          </div>

          <div className="star-vt-gallery">
            {videoTestimonials.map((item, index) => (
              <article className="star-vt-gallery__card" key={item.id}>
                <button
                  type="button"
                  className="star-vt-gallery__photo"
                  onClick={() => openLightbox(index)}
                  aria-label={`Play ${item.title}`}
                >
                  <VideoThumb videoId={item.id} className="star-vt-gallery__thumb" alt={item.title} />
                  <span className="star-vt-gallery__play" aria-hidden="true">
                    <span className="material-symbols-outlined">play_circle</span>
                  </span>
                </button>
                <div className="star-vt-gallery__label">
                  <strong>{item.title}</strong>
                  <span>Star Police Academy</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {lightboxItem && (
        <VideoLightbox
          videoId={lightboxItem.id}
          title={lightboxItem.title}
          index={lightboxIndex}
          total={total}
          onClose={closeLightbox}
          onPrevious={() => setLightboxIndex((current) => (current - 1 + total) % total)}
          onNext={() => setLightboxIndex((current) => (current + 1) % total)}
        />
      )}
    </>
  );
}
