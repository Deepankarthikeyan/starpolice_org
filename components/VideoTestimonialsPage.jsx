import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";

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

function testimonialPosterSrc(item) {
  return item.id ? mqThumbnailUrl(item.id) : "";
}

function useInViewOnce(threshold = 0.12) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return { ref, isVisible };
}

function VideoLightbox({ videoId, title, index, total, onClose, onPrevious, onNext }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const frame = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => window.cancelAnimationFrame(frame);
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
      className={`star-vt-lightbox${isAnimating ? " is-visible" : ""}`}
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
      <div
        className={`star-vt-lightbox__panel${isAnimating ? " is-visible" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
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
            key={videoId}
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

function TestimonialCard({ item, index, isSectionVisible, onOpen }) {
  const poster = testimonialPosterSrc(item);
  const staggerMs = Math.min(index * 55, 660);

  return (
    <li
      className={`star-vt-premium-card${isSectionVisible ? " is-visible" : ""}`}
      style={{ "--vt-stagger": `${staggerMs}ms` }}
    >
      <button
        type="button"
        className="star-vt-premium-hit"
        aria-label={`Watch student testimonial: ${item.title}`}
        onClick={() => onOpen(index)}
      >
        <span className="star-vt-premium-visual">
          {poster ? (
            <img
              className="star-vt-premium-img"
              src={poster}
              alt={item.title}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={(event) => {
                const fallback = mqThumbnailUrl(item.id);
                if (event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
            />
          ) : (
            <span className="star-vt-premium-placeholder">Video URL pending</span>
          )}
          <span className="star-vt-premium-play" aria-hidden="true">
            <span className="star-vt-premium-play__ring" />
            <span className="star-vt-premium-play__icon material-symbols-outlined">play_arrow</span>
          </span>
        </span>
      </button>
      <p className="star-vt-premium-caption">{item.title}</p>
    </li>
  );
}

export default function VideoTestimonialsPage() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { ref: sectionRef, isVisible: isSectionVisible } = useInViewOnce();
  const total = videoTestimonials.length;

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const lightboxItem = lightboxIndex !== null ? videoTestimonials[lightboxIndex] : null;

  return (
    <>
      <section
        ref={sectionRef}
        className={`star-vt-page star-vt-premium pt---80 pb---120${isSectionVisible ? " is-visible" : ""}`}
      >
        <div className="container">
          <header className="star-vt-intro star-vt-premium__head text-center">
            <p className="star-vt-premium__eyebrow">Real stories from our students</p>
            <h2 className="spa-section-title">Student video testimonials</h2>
            <p className="spa-section-text">
              Each card uses the YouTube video thumbnail. Tap to watch the full testimonial.
            </p>
          </header>

          <ul className="star-vt-premium-grid" aria-label="Student video testimonials">
            {videoTestimonials.map((item, index) => (
              <TestimonialCard
                key={item.id || `vt-${index}`}
                item={item}
                index={index}
                isSectionVisible={isSectionVisible}
                onOpen={openLightbox}
              />
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
            setLightboxIndex((current) => (current - 1 + total) % total);
          }}
          onNext={() => {
            setLightboxIndex((current) => (current + 1) % total);
          }}
        />
      ) : null}
    </>
  );
}
