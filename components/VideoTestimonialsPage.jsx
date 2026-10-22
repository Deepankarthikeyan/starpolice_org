import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { videoTestimonials } from "../lib/star-content";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderPause } from "../lib/useAutoSlider";

const MOSAIC_VISIBLE = 9;
const MOSAIC_OFFSET_Y = [22, -16, 10, -24, 14, -10, 20, -14, 8];

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

function maxresThumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

function visibleMosaicIndices(activeIndex, total, count = MOSAIC_VISIBLE) {
  const half = Math.floor(count / 2);
  const indices = [];

  for (let offset = -half; offset <= half; offset += 1) {
    indices.push((activeIndex + offset + total) % total);
  }

  return indices;
}

function MosaicThumb({ videoId, alt = "", loading, isActive }) {
  const [src, setSrc] = useState(() => mqThumbnailUrl(videoId));

  useEffect(() => {
    setSrc(mqThumbnailUrl(videoId));
  }, [videoId]);

  const promoteToHd = (event) => {
    const image = event.currentTarget;
    if (image.dataset.hdChecked === "true") {
      return;
    }
    image.dataset.hdChecked = "true";

    const hd = new Image();
    hd.onload = () => {
      if (hd.naturalWidth >= 200 && hd.naturalHeight >= 200) {
        setSrc(maxresThumbnailUrl(videoId));
      }
    };
    hd.onerror = () => {};
    hd.src = maxresThumbnailUrl(videoId);
  };

  return (
    <img
      className={`star-vt-mosaic-img${isActive ? " is-active" : ""}`}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      onLoad={promoteToHd}
      onError={() => setSrc(mqThumbnailUrl(videoId))}
    />
  );
}

function StripThumb({ videoId, alt = "", loading, isActive }) {
  const [src, setSrc] = useState(() => mqThumbnailUrl(videoId));

  useEffect(() => {
    setSrc(mqThumbnailUrl(videoId));
  }, [videoId]);

  return (
    <img
      className={`star-vt-strip-img${isActive ? " is-active" : ""}`}
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

  const mosaicIndices = useMemo(
    () => visibleMosaicIndices(activeIndex, total),
    [activeIndex, total],
  );

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
          <div className="star-vt-showcase" {...pauseProps}>
            <div className="star-vt-showcase__mosaic">
              <ul className="star-vt-mosaic-list" aria-label="Featured student video stories">
                {mosaicIndices.map((itemIndex, position) => {
                  const item = videoTestimonials[itemIndex];
                  const isActive = itemIndex === activeIndex;

                  return (
                    <li
                      key={`${item.id}-${position}`}
                      className="star-vt-mosaic-list__item"
                      style={{
                        "--vt-mosaic-y": `${MOSAIC_OFFSET_Y[position % MOSAIC_OFFSET_Y.length]}px`,
                        zIndex: isActive ? 4 : 1 + (position % 3),
                      }}
                    >
                      <button
                        type="button"
                        className={`star-vt-mosaic-tile${isActive ? " is-active" : ""}`}
                        aria-label={`Select ${item.title}`}
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => setActiveIndex(itemIndex)}
                      >
                        <MosaicThumb
                          videoId={item.id}
                          alt={item.title}
                          isActive={isActive}
                          loading={isActive ? undefined : "lazy"}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                className="star-vt-showcase__play"
                aria-label={`Play ${activeItem.title}`}
                onClick={() => openLightbox(activeIndex)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  play_arrow
                </span>
              </button>
            </div>

            <div className="star-vt-showcase__copy text-center">
              <p className="star-vt-showcase__eyebrow">
                {activeIndex + 1} / {total} · Student voices
              </p>
              <h2 className="star-vt-showcase__title">Trusted achievers from Star Police Academy</h2>
              <p className="star-vt-showcase__text">
                Real TNUSRB SI, PC, and police exam success stories. Choose a thumbnail below or
                press play to watch the selected story.
              </p>
              <div className="star-vt-showcase__actions">
                <button
                  type="button"
                  className="star-vt-showcase__cta"
                  onClick={() => openLightbox(activeIndex)}
                >
                  Watch {activeItem.title}
                </button>
                <div className="star-vt-showcase__nav">
                  <button type="button" aria-label="Previous story" onClick={() => goTo(activeIndex - 1)}>
                    ‹
                  </button>
                  <button type="button" aria-label="Next story" onClick={() => goTo(activeIndex + 1)}>
                    ›
                  </button>
                </div>
              </div>
            </div>

            <div className="star-vt-strip" aria-label="All video testimonials">
              <ul className="star-vt-strip-list">
                {videoTestimonials.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`star-vt-strip-tile${index === activeIndex ? " is-active" : ""}`}
                      aria-label={`Play ${item.title}`}
                      onClick={() => openLightbox(index)}
                    >
                      <StripThumb
                        videoId={item.id}
                        alt={item.title}
                        isActive={index === activeIndex}
                        loading="lazy"
                      />
                      <span className="star-vt-strip-tile__label">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
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
