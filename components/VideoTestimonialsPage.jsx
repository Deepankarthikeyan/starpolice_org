import { useEffect, useState } from "react";
import { videoTestimonials } from "../lib/star-content";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderPause } from "../lib/useAutoSlider";

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

export default function VideoTestimonialsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isPaused, pauseProps } = useAutoSliderPause();
  const total = videoTestimonials.length;
  const activeItem = videoTestimonials[activeIndex];

  const selectStory = (index) => {
    setActiveIndex(index);
    setIsPlaying(false);
  };

  useEffect(() => {
    setIsPlaying(false);
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused || isPlaying) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, isPlaying, total]);

  return (
    <section className="star-vt-page pt---80 pb---120">
      <div className="container">
        <div className="star-vt-intro text-center">
          <span className="star-vt-intro__eyebrow">Student voices</span>
          <h2 className="spa-section-title">Hear from our achievers</h2>
          <p className="spa-section-text">
            One story at a time — tap play to watch inside the same frame, or pick another success story below.
          </p>
        </div>

        <div className="star-vt-spotlight" {...pauseProps}>
          <div className="star-vt-spotlight__shell">
            <div className="star-vt-spotlight__accent" aria-hidden="true" />
            <div className="star-vt-spotlight__frame">
              {isPlaying ? (
                <div className="star-vt-spotlight__player">
                  <iframe
                    title={activeItem.title}
                    src={youtubeEmbedUrl(activeItem.id, true)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <button
                    type="button"
                    className="star-vt-spotlight__close"
                    aria-label="Stop video and show thumbnail"
                    onClick={() => setIsPlaying(false)}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="star-vt-spotlight__poster"
                  aria-label={`Play ${activeItem.title}`}
                  onClick={() => setIsPlaying(true)}
                >
                  <img
                    src={youtubeThumbnail(activeItem.id)}
                    alt=""
                    className="star-vt-spotlight__thumb"
                  />
                  <span className="star-vt-spotlight__index">{activeIndex + 1}</span>
                  <span className="star-vt-spotlight__play" aria-hidden="true">
                    <span className="material-symbols-outlined">play_circle</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="star-vt-spotlight__nav">
            <button
              type="button"
              className="star-vt-spotlight__arrow"
              aria-label="Previous story"
              onClick={() => selectStory((activeIndex - 1 + total) % total)}
            >
              ‹
            </button>
            <div
              className="star-vt-spotlight__bar"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={activeIndex + 1}
              aria-label="Story progress"
            >
              <span style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
            </div>
            <button
              type="button"
              className="star-vt-spotlight__arrow"
              aria-label="Next story"
              onClick={() => selectStory((activeIndex + 1) % total)}
            >
              ›
            </button>
          </div>
        </div>

        <div className="star-vt-strip-head">
          <h3>More success stories</h3>
          <p>Select a thumbnail — it loads in the player above.</p>
        </div>

        <div className="star-vt-strip" role="tablist" aria-label="Video testimonials">
          {videoTestimonials.map((item, index) => (
            <button
              type="button"
              key={item.id}
              role="tab"
              aria-selected={index === activeIndex}
              className={`star-vt-strip__item${index === activeIndex ? " is-active" : ""}`}
              onClick={() => selectStory(index)}
            >
              <img src={youtubeThumbnail(item.id)} alt="" loading="lazy" />
              <span className="star-vt-strip__index">{index + 1}</span>
              <span className="star-vt-strip__play-icon material-symbols-outlined" aria-hidden="true">
                play_arrow
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
