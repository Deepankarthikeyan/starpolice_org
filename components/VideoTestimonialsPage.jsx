import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderPause } from "../lib/useAutoSlider";

const COLLAGE_VARIANTS = 8;

function youtubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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

  const openLightbox = (index) => {
    setActiveIndex(index);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goTo = (nextIndex) => {
    setActiveIndex(nextIndex);
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
              Watch featured stories below or browse the full collage of student videos.
            </p>
          </div>

          <div className="star-vt-hero" {...pauseProps}>
            <div className="star-vt-hero__stage">
              {videoTestimonials.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={`star-vt-hero__slide${index === activeIndex ? " is-active" : ""}`}
                  aria-hidden={index !== activeIndex}
                  onClick={() => openLightbox(index)}
                >
                  <img src={youtubeThumbnail(item.id)} alt="" loading="lazy" />
                  <span className="star-vt-hero__play material-symbols-outlined" aria-hidden="true">
                    play_circle
                  </span>
                  <span className="star-vt-hero__badge">Story {index + 1}</span>
                </button>
              ))}
            </div>

            <div className="star-vt-hero__controls">
              <button
                type="button"
                className="star-vt-hero__arrow"
                aria-label="Previous story"
                onClick={() => goTo((activeIndex - 1 + total) % total)}
              >
                ‹
              </button>
              <span className="star-vt-hero__counter" aria-live="polite">
                {activeIndex + 1} / {total}
              </span>
              <button
                type="button"
                className="star-vt-hero__arrow"
                aria-label="Next story"
                onClick={() => goTo((activeIndex + 1) % total)}
              >
                ›
              </button>
            </div>
          </div>

          <div className="star-vt-collage-head text-center">
            <h3>All video testimonials</h3>
          </div>

          <div className="star-vt-collage">
            {videoTestimonials.map((item, index) => (
              <button
                type="button"
                key={`collage-${item.id}`}
                className={`star-vt-collage__cell star-vt-collage__cell--${(index % COLLAGE_VARIANTS) + 1}${
                  index === activeIndex ? " is-active" : ""
                }`}
                onClick={() => openLightbox(index)}
              >
                <img src={youtubeThumbnail(item.id)} alt="" loading="lazy" />
                <span className="star-vt-collage__shade" aria-hidden="true" />
                <span className="star-vt-collage__play material-symbols-outlined" aria-hidden="true">
                  play_circle
                </span>
                <span className="star-vt-collage__label">{item.title}</span>
              </button>
            ))}
          </div>
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
