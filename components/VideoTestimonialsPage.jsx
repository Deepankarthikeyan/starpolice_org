import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderPause } from "../lib/useAutoSlider";

const SLIDE_TRANSITIONS = ["fade", "slide-left", "slide-up", "zoom"];

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

function videoAt(items, index, delta) {
  return items[(index + delta + items.length) % items.length];
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
          <p>Real feedback from Star Police Academy students and families.</p>
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

function VideoMosaicWall({ items, onPlay }) {
  const slots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="star-vt-mosaic">
      {slots.map((offset, slotIndex) => {
        const item = items[offset % items.length];
        const index = offset % items.length;
        return (
          <button
            type="button"
            key={`${item.id}-${slotIndex}`}
            className={`star-vt-mosaic__cell star-vt-mosaic__cell--${(slotIndex % 6) + 1}`}
            onClick={() => onPlay(index)}
            aria-label={`Play ${item.title}`}
          >
            <VideoThumb videoId={item.id} className="star-vt-mosaic__img" />
          </button>
        );
      })}
    </div>
  );
}

function FeaturedSlide({ items, item, index, isActive, transition, onPlay }) {
  const layoutClass = `star-vt-slide--${item.layout}`;
  const prev = videoAt(items, index, -1);
  const next = videoAt(items, index, 1);
  const prev2 = videoAt(items, index, -2);
  const next2 = videoAt(items, index, 2);

  return (
    <article
      className={`star-vt-slide ${layoutClass} star-vt-slide--${transition}${isActive ? " is-active" : ""}`}
      aria-hidden={!isActive}
    >
      <div className="star-vt-slide__glow" aria-hidden="true" />
      <div className="star-vt-slide__visual">
        <button type="button" className="star-vt-slide__main" onClick={() => onPlay(index)}>
          <VideoThumb videoId={item.id} className="star-vt-slide__thumb" alt={item.title} />
          <span className="star-vt-slide__play" aria-hidden="true">
            <span className="material-symbols-outlined">play_circle</span>
          </span>
          <span className="star-vt-slide__badge">Story {index + 1}</span>
        </button>
        <div className="star-vt-slide__photos" aria-hidden="true">
          <VideoThumb videoId={prev.id} className="star-vt-slide__photo star-vt-slide__photo--a" />
          <VideoThumb videoId={next.id} className="star-vt-slide__photo star-vt-slide__photo--b" />
          <VideoThumb videoId={prev2.id} className="star-vt-slide__photo star-vt-slide__photo--c" />
        </div>
        {item.layout === "spotlight" && (
          <div className="star-vt-slide__orbit" aria-hidden="true">
            <VideoThumb videoId={next2.id} className="star-vt-slide__orbit-thumb star-vt-slide__orbit-thumb--1" />
            <VideoThumb videoId={prev.id} className="star-vt-slide__orbit-thumb star-vt-slide__orbit-thumb--2" />
            <VideoThumb videoId={next.id} className="star-vt-slide__orbit-thumb star-vt-slide__orbit-thumb--3" />
            <VideoThumb videoId={prev2.id} className="star-vt-slide__orbit-thumb star-vt-slide__orbit-thumb--4" />
          </div>
        )}
        {item.layout === "reel" && (
          <div className="star-vt-slide__reel" aria-hidden="true">
            {[prev2, prev, next].map((reelItem) => (
              <div key={reelItem.id} className="star-vt-slide__reel-frame">
                <VideoThumb videoId={reelItem.id} className="star-vt-slide__reel-thumb" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="star-vt-slide__copy">
        <span className="star-vt-slide__eyebrow">Student voice</span>
        <h2>{item.title}</h2>
        <p>Short video testimonial from our YouTube channel — tap play to watch.</p>
        <span className="star-vt-slide__cta">
          <span className="material-symbols-outlined" aria-hidden="true">videocam</span>
          Play video
        </span>
      </div>
    </article>
  );
}

export default function VideoTestimonialsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [transitionName, setTransitionName] = useState(SLIDE_TRANSITIONS[0]);
  const { isPaused, pauseProps } = useAutoSliderPause();
  const total = videoTestimonials.length;

  const goTo = (nextIndex, transitionOverride) => {
    const normalized = (nextIndex + total) % total;
    setTransitionName(transitionOverride || SLIDE_TRANSITIONS[normalized % SLIDE_TRANSITIONS.length]);
    setActiveIndex(normalized);
  };

  useEffect(() => {
    if (isPaused || lightboxIndex !== null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % total;
        setTransitionName(SLIDE_TRANSITIONS[next % SLIDE_TRANSITIONS.length]);
        return next;
      });
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, lightboxIndex, total]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const lightboxItem = lightboxIndex !== null ? videoTestimonials[lightboxIndex] : null;

  return (
    <>
      <section className="star-vt-page pt---80 pb---120">
        <div className="container">
          <div className="star-vt-intro text-center">
            <h2 className="spa-section-title">Testimonials</h2>
            <p className="spa-section-text">
              Every frame below is from your real student video testimonials on YouTube — swipe the featured
              story, browse the film strip, or open any tile to watch.
            </p>
          </div>

          <VideoMosaicWall items={videoTestimonials} onPlay={openLightbox} />

          <div className="star-vt-showcase" {...pauseProps}>
            <div className="star-vt-showcase__stage">
              {videoTestimonials.map((item, index) => (
                <FeaturedSlide
                  key={item.id}
                  items={videoTestimonials}
                  item={item}
                  index={index}
                  isActive={index === activeIndex}
                  transition={transitionName}
                  onPlay={openLightbox}
                />
              ))}
            </div>
            <div className="star-vt-showcase__controls">
              <button
                type="button"
                className="star-vt-showcase__arrow"
                aria-label="Previous story"
                onClick={() => goTo(activeIndex - 1, "slide-left")}
              >
                ‹
              </button>
              <div className="star-vt-showcase__progress" aria-live="polite">
                <span className="star-vt-showcase__counter">
                  Story {activeIndex + 1} of {total}
                </span>
                <div
                  className="star-vt-showcase__bar"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={total}
                  aria-valuenow={activeIndex + 1}
                  aria-label="Slideshow progress"
                >
                  <span style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
                </div>
              </div>
              <button
                type="button"
                className="star-vt-showcase__arrow"
                aria-label="Next story"
                onClick={() => goTo(activeIndex + 1, "slide-left")}
              >
                ›
              </button>
            </div>
          </div>

          <div className="star-vt-filmstrip-wrap">
            <p className="star-vt-filmstrip-label">Video reel</p>
            <div className="star-vt-filmstrip" role="list">
              {videoTestimonials.map((item, index) => (
                <button
                  type="button"
                  key={`strip-${item.id}`}
                  className={`star-vt-filmstrip__frame${index === activeIndex ? " is-current" : ""}`}
                  onClick={() => {
                    goTo(index, "fade");
                    openLightbox(index);
                  }}
                  role="listitem"
                  aria-label={`Play ${item.title}`}
                >
                  <VideoThumb videoId={item.id} className="star-vt-filmstrip__thumb" alt={item.title} />
                  <span className="star-vt-filmstrip__num">{index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="star-vt-grid-head">
            <h3>All testimonials</h3>
            <p>Tap any short to play — thumbnails are pulled from your YouTube videos only.</p>
          </div>
          <div className="star-vt-grid star-vt-grid--bento">
            {videoTestimonials.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={`star-vt-grid__card star-vt-grid__card--${(index % 6) + 1}`}
                onClick={() => openLightbox(index)}
              >
                <VideoThumb videoId={item.id} alt={item.title} className="star-vt-grid__thumb" />
                <span className="star-vt-grid__overlay">
                  <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
                  <strong>{item.title}</strong>
                </span>
              </button>
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
