"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoSliderInterval, useAutoSliderPause } from "../lib/useAutoSlider";

export default function SiTrainingShowcase({ items }) {
  const mockItems = useMemo(() => items.filter((item) => item.group === "mock"), [items]);
  const physicalItems = useMemo(() => items.filter((item) => item.group === "physical"), [items]);

  const [activeGroup, setActiveGroup] = useState("mock");
  const [activeIndexInGroup, setActiveIndexInGroup] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const transitionRef = useRef(null);
  const { isPaused, pauseProps } = useAutoSliderPause();

  const visibleItems = activeGroup === "mock" ? mockItems : physicalItems;
  const activeItem = visibleItems[activeIndexInGroup] || visibleItems[0];

  const changeItem = (nextIndex) => {
    if (!visibleItems.length || nextIndex === activeIndexRef.current || isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    if (transitionRef.current) {
      window.clearTimeout(transitionRef.current);
    }

    transitionRef.current = window.setTimeout(() => {
      activeIndexRef.current = nextIndex;
      setActiveIndexInGroup(nextIndex);
      transitionRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }, 500);
    }, 350);
  };

  const switchGroup = (group) => {
    if (group === activeGroup) {
      return;
    }

    activeIndexRef.current = 0;
    setActiveGroup(group);
    setActiveIndexInGroup(0);
    isTransitioningRef.current = false;
    setIsTransitioning(false);

    if (transitionRef.current) {
      window.clearTimeout(transitionRef.current);
    }
  };

  const showPrevious = () => {
    if (!visibleItems.length) {
      return;
    }

    changeItem((activeIndexRef.current + visibleItems.length - 1) % visibleItems.length);
  };

  const showNext = () => {
    if (!visibleItems.length) {
      return;
    }

    changeItem((activeIndexRef.current + 1) % visibleItems.length);
  };

  useEffect(() => {
    activeIndexRef.current = activeIndexInGroup;
  }, [activeIndexInGroup, activeGroup]);

  useEffect(() => {
    if (activeIndexInGroup >= visibleItems.length) {
      activeIndexRef.current = 0;
      setActiveIndexInGroup(0);
    }
  }, [activeIndexInGroup, visibleItems.length]);

  useAutoSliderInterval(showNext, isPaused, [visibleItems.length, activeGroup]);

  useEffect(() => () => {
    if (transitionRef.current) {
      window.clearTimeout(transitionRef.current);
    }
  }, []);

  if (!activeItem) {
    return null;
  }

  return (
    <div className="si-training-showcase pt---30">
      <div className="si-training-showcase__filters" role="tablist" aria-label="Training categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeGroup === "mock"}
          className={activeGroup === "mock" ? "is-active" : ""}
          onClick={() => switchGroup("mock")}
        >
          <span aria-hidden="true" className="material-symbols-outlined">quiz</span>
          Mock Tests
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeGroup === "physical"}
          className={activeGroup === "physical" ? "is-active" : ""}
          onClick={() => switchGroup("physical")}
        >
          <span aria-hidden="true" className="material-symbols-outlined">fitness_center</span>
          Physical Training
        </button>
      </div>

      <div className="si-training-showcase__shell" {...pauseProps}>
        <button
          type="button"
          className="si-training-showcase__arrow si-training-showcase__arrow--prev"
          aria-label="Previous training highlight"
          onClick={showPrevious}
        >
          ‹
        </button>
        <div
          className={`si-training-showcase__spotlight si-training-showcase__spotlight--${activeItem.group}${isTransitioning ? " is-transitioning" : ""}`}
          aria-live="polite"
          key={`spotlight-${activeGroup}-${activeIndexInGroup}`}
        >
          <div className="si-training-showcase__spotlight-bg" aria-hidden="true">
            <span className={`si-training-showcase__spotlight-pattern si-training-showcase__spotlight-pattern--${activeItem.group}`} />
          </div>
          <div className="si-training-showcase__spotlight-content">
            <div className="si-training-showcase__spotlight-top">
              <span className="si-training-showcase__badge">{activeItem.groupLabel}</span>
              <span className="si-training-showcase__index">
                {String(activeIndexInGroup + 1).padStart(2, "0")}
                <em>/{String(visibleItems.length).padStart(2, "0")}</em>
              </span>
            </div>
            <span className="si-training-showcase__icon" aria-hidden="true">
              <span className="material-symbols-outlined">{activeItem.icon}</span>
            </span>
            <h3>{activeItem.title}</h3>
            <p>{activeItem.text}</p>
          </div>
        </div>
        <button
          type="button"
          className="si-training-showcase__arrow si-training-showcase__arrow--next"
          aria-label="Next training highlight"
          onClick={showNext}
        >
          ›
        </button>
      </div>

      <div className="si-training-showcase__rail" aria-label="Training highlights">
        {visibleItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`si-training-showcase__chip si-training-showcase__chip--${item.group}${index === activeIndexInGroup ? " is-active" : ""}`}
            aria-current={index === activeIndexInGroup ? "true" : undefined}
            aria-label={`Show ${item.title}`}
            onClick={() => changeItem(index)}
          >
            <span aria-hidden="true" className="material-symbols-outlined">{item.icon}</span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
