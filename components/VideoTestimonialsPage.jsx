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

function VideoThumb({ videoId, alt = "", loading }) {
  const [src, setSrc] = useState(() => mqThumbnailUrl(videoId));

  useEffect(() => {
    setSrc(mqThumbnailUrl(videoId));
  }, [videoId]);

  return (
    <img
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
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { isPaused, pauseProps } = useAutoSliderPause();
  const total = videoTestimonials.length;

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 991 ? 1 : 2);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    if (isPaused || lightboxIndex !== null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % total);
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, lightboxIndex, total]);

  const visibleItems = Array.from({ length: visibleCount }, (_, index) => {
    const itemIndex = (startIndex + index) % total;
    return { ...videoTestimonials[itemIndex], itemIndex };
  });

  const showPrevious = () => {
    setStartIndex((current) => (current + total - 1) % total);
  };

  const showNext = () => {
    setStartIndex((current) => (current + 1) % total);
  };

  const openLightbox = (index) => {
    setStartIndex(index);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const lightboxItem = lightboxIndex !== null ? videoTestimonials[lightboxIndex] : null;

  return (
    <>
      <section className="spa-testimonials-cards pt---110 pb---120">
        <div className="container">
          <div className="react__title__section-all pb---30">
            <div className="row">
              <div className="col-md-12 text-center">
                <h2 className="react__tittle">Testimonials</h2>
              </div>
            </div>
          </div>

          <div className="spa-testimonials-cards__slider" {...pauseProps}>
            <button
              type="button"
              className="spa-testimonials-cards__arrow spa-testimonials-cards__arrow--prev"
              aria-label="Previous video testimonial"
              onClick={showPrevious}
            >
              ‹
            </button>

            <div className="spa-testimonials-cards__track">
              {visibleItems.map((item) => (
                <article className="spa-testimonial-card spa-testimonial-card--video" key={`${item.id}-${item.itemIndex}`}>
                  <div className="spa-testimonial-card__top">
                    <span className="spa-testimonial-card__quote" aria-hidden="true">“</span>
                    <div className="testimonial__ratings">
                      <em className="icon_star" />
                      <em className="icon_star" />
                      <em className="icon_star" />
                      <em className="icon_star" />
                      <em className="icon_star_alt" />
                      <span>Student voice</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="spa-testimonial-card__video-hit"
                    aria-label={`Play ${item.title}`}
                    onClick={() => openLightbox(item.itemIndex)}
                  >
                    <VideoThumb videoId={item.id} alt={item.title} />
                    <span className="spa-testimonial-card__video-play material-symbols-outlined" aria-hidden="true">
                      play_circle
                    </span>
                  </button>

                  <p className="spa-testimonial-card__text">
                    Watch how this achiever shares their Star Police Academy journey and exam success.
                  </p>

                  <div className="spa-testimonial-card__author">
                    <span className="spa-user-avatar spa-user-avatar--sm" aria-hidden="true">
                      <span className="material-symbols-outlined">videocam</span>
                    </span>
                    <div className="spa-testimonial-card__author-meta">
                      <strong>{item.title}</strong>
                      <span>Video testimonial</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="spa-testimonials-cards__arrow spa-testimonials-cards__arrow--next"
              aria-label="Next video testimonial"
              onClick={showNext}
            >
              ›
            </button>
          </div>

          <div className="spa-testimonials-cards__dots" aria-label="Video testimonial slides">
            {videoTestimonials.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show video ${index + 1}`}
                className={index === startIndex ? "is-active" : ""}
                onClick={() => setStartIndex(index)}
              />
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
            setStartIndex(next);
          }}
          onNext={() => {
            const next = (lightboxIndex + 1) % total;
            setLightboxIndex(next);
            setStartIndex(next);
          }}
        />
      ) : null}
    </>
  );
}
