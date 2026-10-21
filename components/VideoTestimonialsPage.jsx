import { useEffect, useRef, useState } from "react";
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
  const [playingIndex, setPlayingIndex] = useState(null);
  const { isPaused, pauseProps } = useAutoSliderPause();
  const total = videoTestimonials.length;

  const selectStory = (index) => {
    setActiveIndex(index);
    setPlayingIndex(null);
  };

  const handleCardActivate = (index) => {
    if (index !== activeIndex) {
      selectStory(index);
      return;
    }

    if (playingIndex === null) {
      setPlayingIndex(index);
    }
  };

  useEffect(() => {
    if (playingIndex !== null && playingIndex !== activeIndex) {
      setPlayingIndex(null);
    }
  }, [activeIndex, playingIndex]);

  useEffect(() => {
    if (isPaused || playingIndex !== null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, playingIndex, total]);

  return (
    <section className="star-vt-page pt---80 pb---120">
      <div className="container">
        <div className="star-vt-intro text-center">
          <h2 className="spa-section-title">Hear from our achievers</h2>
          <p className="spa-section-text">
            Tap a story to select it, then tap again to play the video in the same card.
          </p>
        </div>

        <div className="star-vt-strip-wrap" {...pauseProps}>
          <button
            type="button"
            className="star-vt-strip__arrow"
            aria-label="Previous story"
            onClick={() => selectStory((activeIndex - 1 + total) % total)}
          >
            ‹
          </button>

          <div className="star-vt-strip" role="tablist" aria-label="Video testimonials">
            {videoTestimonials.map((item, index) => {
              const isActive = index === activeIndex;
              const isPlaying = playingIndex === index;

              return (
                <div
                  key={item.id}
                  className={`star-vt-strip__item-wrap${isActive ? " is-active" : ""}`}
                >
                  {isPlaying ? (
                    <div className="star-vt-strip__item star-vt-strip__item--playing">
                      <div className="star-vt-strip__player">
                        <iframe
                          title={item.title}
                          src={youtubeEmbedUrl(item.id, true)}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <button
                        type="button"
                        className="star-vt-strip__close"
                        aria-label="Stop video"
                        onClick={() => setPlayingIndex(null)}
                      >
                        ×
                      </button>
                      <span className="star-vt-strip__index">{index + 1}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`star-vt-strip__item${isActive ? " is-active" : ""}`}
                      onClick={() => handleCardActivate(index)}
                    >
                      <img src={youtubeThumbnail(item.id)} alt="" loading="lazy" />
                      <span className="star-vt-strip__index">{index + 1}</span>
                      <span
                        className="star-vt-strip__play-icon material-symbols-outlined"
                        aria-hidden="true"
                      >
                        play_arrow
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="star-vt-strip__arrow"
            aria-label="Next story"
            onClick={() => selectStory((activeIndex + 1) % total)}
          >
            ›
          </button>
        </div>

        <p className="star-vt-strip__counter" aria-live="polite">
          Story {activeIndex + 1} of {total}
        </p>
      </div>
    </section>
  );
}
