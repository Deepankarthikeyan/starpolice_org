import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";
import { useAutoSliderPause } from "../lib/useAutoSlider";

export const SHOWCASE_AUTO_MS = 7000;

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

const YT_THUMB_FALLBACK_ORDER = ["mqdefault", "hqdefault", "sddefault"];

function youtubeThumbUrl(videoId, variant) {
  return `https://i.ytimg.com/vi/${videoId}/${variant}.jpg`;
}

function testimonialPosterSrc(item) {
  return item.id ? youtubeThumbUrl(item.id, YT_THUMB_FALLBACK_ORDER[0]) : "";
}

function advanceTestimonialThumbOnError(image, videoId) {
  const variants = YT_THUMB_FALLBACK_ORDER;
  const currentVariant = variants.find((name) => image.src.includes(`/${name}.jpg`));
  const nextIndex = currentVariant ? variants.indexOf(currentVariant) + 1 : 1;
  const nextVariant = variants[nextIndex];
  if (nextVariant) {
    image.src = youtubeThumbUrl(videoId, nextVariant);
  }
}

export function useInViewOnce(threshold = 0.12) {
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

export function VideoLightbox({ videoId, title, index, total, onClose, onPrevious, onNext }) {
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

export function TestimonialThumb({ item, className, loading = "lazy", fetchPriority }) {
  const poster = testimonialPosterSrc(item);
  if (!poster) {
    return <span className="star-vt-premium-placeholder">Video URL pending</span>;
  }

  return (
    <img
      className={className}
      src={poster}
      alt={item.title}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      draggable={false}
      onError={(event) => {
        advanceTestimonialThumbOnError(event.currentTarget, item.id);
      }}
    />
  );
}

export function TestimonialShowcase({
  activeIndex,
  direction,
  total,
  onPrev,
  onNext,
  onSelect,
  onPlay,
  isPaused,
  badgeLabel = "Student spotlight",
  className = "",
}) {
  const filmstripRef = useRef(null);
  const activeItem = videoTestimonials[activeIndex];
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;
  const enterClass = direction > 0 ? "from-next" : "from-prev";

  useEffect(() => {
    const strip = filmstripRef.current;
    if (!strip) {
      return;
    }
    const activeChip = strip.querySelector(`[data-film-index="${activeIndex}"]`);
    activeChip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  return (
    <div className={`star-vt-showcase${className ? ` ${className}` : ""}`} aria-live="polite">
      <div className="star-vt-showcase__glow" aria-hidden="true" />
      <p className="star-vt-showcase__badge">
        <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
        {badgeLabel}
      </p>

      <div className="star-vt-showcase__reel" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="star-vt-showcase__controls">
        <button
          type="button"
          className="star-vt-showcase__arrow star-vt-showcase__arrow--prev"
          aria-label="Previous story"
          onClick={onPrev}
        >
          ‹
        </button>

        <div className="star-vt-showcase__stage">
          <button
            type="button"
            className="star-vt-showcase__peek star-vt-showcase__peek--prev"
            aria-label={`Previous: ${videoTestimonials[prevIndex].title}`}
            onClick={onPrev}
          >
            <TestimonialThumb
              item={videoTestimonials[prevIndex]}
              className="star-vt-premium-img star-vt-premium-img--peek"
              loading="lazy"
            />
          </button>

          <div className="star-vt-showcase__viewport">
            <article
              key={activeIndex}
              className={`star-vt-showcase__slide star-vt-showcase__slide--${enterClass}`}
            >
              <button
                type="button"
                className="star-vt-premium-hit"
                aria-label={`Watch student testimonial: ${activeItem.title}`}
                onClick={() => onPlay(activeIndex)}
              >
                <span className="star-vt-premium-visual star-vt-premium-visual--showcase">
                  <TestimonialThumb
                    item={activeItem}
                    className="star-vt-premium-img star-vt-premium-img--showcase"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <span className="star-vt-premium-play star-vt-premium-play--showcase" aria-hidden="true">
                    <span className="star-vt-premium-play__ring" />
                    <span className="star-vt-premium-play__icon material-symbols-outlined">play_arrow</span>
                  </span>
                </span>
              </button>
            </article>
          </div>

          <button
            type="button"
            className="star-vt-showcase__peek star-vt-showcase__peek--next"
            aria-label={`Next: ${videoTestimonials[nextIndex].title}`}
            onClick={onNext}
          >
            <TestimonialThumb
              item={videoTestimonials[nextIndex]}
              className="star-vt-premium-img star-vt-premium-img--peek"
              loading="lazy"
            />
          </button>
        </div>

        <button
          type="button"
          className="star-vt-showcase__arrow star-vt-showcase__arrow--next"
          aria-label="Next story"
          onClick={onNext}
        >
          ›
        </button>
      </div>

      <div className="star-vt-showcase__meta">
        <p className="star-vt-showcase__title">{activeItem.title}</p>
        <p className="star-vt-showcase__counter">
          Story <strong>{activeIndex + 1}</strong> of {total}
        </p>
        <div
          className={`star-vt-showcase__progress${isPaused ? " is-paused" : ""}`}
          aria-hidden="true"
          key={activeIndex}
          style={{ "--vt-showcase-ms": `${SHOWCASE_AUTO_MS}ms` }}
        >
          <span />
        </div>
      </div>

      <div
        ref={filmstripRef}
        className="star-vt-showcase__filmstrip"
        role="tablist"
        aria-label="Browse all stories in the slideshow"
      >
        {videoTestimonials.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-film-index={index}
            aria-selected={index === activeIndex}
            aria-label={`Show ${item.title}`}
            className={`star-vt-showcase__film-chip${index === activeIndex ? " is-active" : ""}`}
            onClick={() => onSelect(index)}
          >
            <TestimonialThumb item={item} className="star-vt-showcase__film-thumb" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function TestimonialCard({ item, index, isSectionVisible, isCurrent, onOpen }) {
  const staggerMs = Math.min(index * 55, 660);

  return (
    <li
      className={`star-vt-premium-card${isSectionVisible ? " is-visible" : ""}${isCurrent ? " is-current" : ""}`}
      style={{ "--vt-stagger": `${staggerMs}ms` }}
    >
      <button
        type="button"
        className="star-vt-premium-hit"
        aria-label={`Watch student testimonial: ${item.title}`}
        onClick={() => onOpen(index)}
      >
        <span className="star-vt-premium-visual">
          <TestimonialThumb
            item={item}
            className="star-vt-premium-img"
            loading={index < 4 ? "eager" : "lazy"}
            fetchPriority={index < 4 ? "high" : undefined}
          />
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

export function useVideoTestimonialSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { isPaused, pauseProps } = useAutoSliderPause();
  const total = videoTestimonials.length;

  const goTo = (index) => {
    const next = (index + total) % total;
    if (next === activeIndex) {
      return;
    }
    if (activeIndex === total - 1 && next === 0) {
      setSlideDirection(1);
    } else if (activeIndex === 0 && next === total - 1) {
      setSlideDirection(-1);
    } else {
      setSlideDirection(next > activeIndex ? 1 : -1);
    }
    setActiveIndex(next);
  };

  const goNext = () => {
    setSlideDirection(1);
    setActiveIndex((current) => (current + 1) % total);
  };

  const goPrev = () => {
    setSlideDirection(-1);
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const openLightbox = (index) => {
    const next = (index + total) % total;
    goTo(next);
    setLightboxIndex(next);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  useEffect(() => {
    if (isPaused || lightboxIndex !== null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSlideDirection(1);
      setActiveIndex((current) => (current + 1) % total);
    }, SHOWCASE_AUTO_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, lightboxIndex, total]);

  const lightboxItem = lightboxIndex !== null ? videoTestimonials[lightboxIndex] : null;

  return {
    activeIndex,
    slideDirection,
    lightboxIndex,
    lightboxItem,
    total,
    isPaused,
    pauseProps,
    goTo,
    goNext,
    goPrev,
    openLightbox,
    closeLightbox,
    setLightboxIndex,
  };
}

export function VideoTestimonialsSpotlight({ className = "", badgeLabel, cta }) {
  const {
    activeIndex,
    slideDirection,
    lightboxIndex,
    lightboxItem,
    total,
    isPaused,
    pauseProps,
    goTo,
    goNext,
    goPrev,
    openLightbox,
    closeLightbox,
    setLightboxIndex,
  } = useVideoTestimonialSlideshow();

  return (
    <div className={`star-vt-spotlight-block${className ? ` ${className}` : ""}`} {...pauseProps}>
      <TestimonialShowcase
        activeIndex={activeIndex}
        direction={slideDirection}
        total={total}
        onPrev={goPrev}
        onNext={goNext}
        onSelect={goTo}
        onPlay={openLightbox}
        isPaused={isPaused || lightboxIndex !== null}
        badgeLabel={badgeLabel}
      />
      {cta ? <div className="star-vt-spotlight-block__cta">{cta}</div> : null}
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
            goTo(next);
          }}
          onNext={() => {
            const next = (lightboxIndex + 1) % total;
            setLightboxIndex(next);
            goTo(next);
          }}
        />
      ) : null}
    </div>
  );
}
