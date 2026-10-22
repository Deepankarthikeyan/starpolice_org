import { videoTestimonials } from "../lib/star-content";
import {
  TestimonialCard,
  TestimonialShowcase,
  useInViewOnce,
  useVideoTestimonialSlideshow,
  VideoLightbox,
} from "./VideoTestimonialUi";

export default function VideoTestimonialsPage() {
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
  const { ref: sectionRef, isVisible: isSectionVisible } = useInViewOnce();

  return (
    <>
      <section
        ref={sectionRef}
        className={`star-vt-page star-vt-premium pt---80 pb---120${isSectionVisible ? " is-visible" : ""}`}
        {...pauseProps}
      >
        <div className="container">
          <header className="star-vt-intro star-vt-premium__head text-center">
            <p className="star-vt-premium__eyebrow">Real stories from our students</p>
            <h2 className="spa-section-title">Student video testimonials</h2>
            <p className="spa-section-text">
              Enjoy the spotlight slideshow, then explore every YouTube Short below. Tap play to watch.
            </p>
          </header>

          <TestimonialShowcase
            activeIndex={activeIndex}
            direction={slideDirection}
            total={total}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={goTo}
            onPlay={openLightbox}
            isPaused={isPaused || lightboxIndex !== null}
          />

          <h3 className="star-vt-all-head text-center">All student video testimonials</h3>

          <ul className="star-vt-premium-grid" aria-label="Student video testimonials">
            {videoTestimonials.map((item, index) => (
              <TestimonialCard
                key={item.id || `vt-${index}`}
                item={item}
                index={index}
                isSectionVisible={isSectionVisible}
                isCurrent={index === activeIndex}
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
    </>
  );
}
