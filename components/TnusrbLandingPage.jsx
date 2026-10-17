import Link from "next/link";
import SiCourseTopicsSlider from "./SiCourseTopicsSlider";
import SiTrainingShowcase from "./SiTrainingShowcase";
import { academy, contact, stats, testimonials } from "../lib/star-content";
import {
  tnusrbBatches,
  tnusrbCourse,
  tnusrbCourseFeatures,
  tnusrbCourseTopics,
  tnusrbEligibilityRows,
  tnusrbFacultyCards,
  tnusrbFaqs,
  tnusrbFeeHighlights,
  tnusrbHeroHighlights,
  tnusrbLearningModes,
  powerOfConstableSection,
  tnusrbPhysicalEvents,
  tnusrbSelectionProcessSteps,
  tnusrbStudyMaterials,
  tnusrbSyllabusSections,
  tnusrbTrainingFlow,
  tnusrbTrainingSpotlights,
  tnusrbTrustPoints,
} from "../lib/tnusrb-landing-content";

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function TestimonialAvatar({ name }) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <span className="spa-user-avatar spa-user-avatar--sm" aria-label={name}>
      <span aria-hidden="true" className="material-symbols-outlined">person</span>
      <span aria-hidden="true" className="spa-user-avatar__initial">{initial}</span>
    </span>
  );
}

export default function TnusrbLandingPage() {
  return (
    <div className="react-wrapper-inner exact-home-page si-landing-page">
      <section
        className="hero3__area exact-spa-hero spa-main-hero p-relative"
        style={{ backgroundImage: `url(${academy.heroBackground})` }}
      >
        <div className="exact-spa-hero__overlay" />
        <div className="container p-relative">
          <div className="row g-4 spa-main-hero__row">
            <div className="col-lg-7 spa-main-hero__col">
              <div className="spa-main-hero__content">
                <span className="spa-main-hero__eyebrow">TNUSRB Constable Coaching · Tamil Nadu</span>
                <h1 className="spa-main-hero__title">
                  {tnusrbCourse.title}
                </h1>
                <p className="spa-main-hero__text">
                  {tnusrbCourse.summary}
                </p>
                <ul className="spa-main-hero__highlights">
                  {tnusrbHeroHighlights.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="spa-main-hero__actions">
                  <Link className="exact-spa-hero__register-btn" href="/contact-us">
                    Contact Us <ArrowIcon />
                  </Link>
                  <a className="spa-main-hero__btn-outline" href={`tel:${contact.phonePrimary.replace(/\s/g, "")}`}>
                    Call {contact.phonePrimary}
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-5 spa-main-hero__col">
              <div className="spa-main-hero__card spa-main-hero__card--photo">
                <h3>Best TNUSRB Police Constable Coaching Centre in Tamil Nadu</h3>
                <div className="spa-main-hero__card-visual">
                  <img
                    src={tnusrbCourse.image}
                    alt={tnusrbCourse.shortTitle}
                  />
                </div>
                <p>Written exam · PET · Certificate verification · Medical · Final selection support</p>
                <div className="spa-main-hero__stats">
                  {stats.slice(0, 4).map((item) => (
                    <div key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--why pt---100 pb---100">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <span className="spa-section-eyebrow">Why Choose Us</span>
              <h2 className="spa-section-title">Why Choose Star Police Academy?</h2>
              <p className="spa-section-text" style={{ marginLeft: 0, maxWidth: "none" }}>
                Trusted TNUSRB Police Constable coaching with expert faculty, structured preparation, physical
                training, and complete mentorship from application to final selection.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="spa-feature-grid">
                {tnusrbTrustPoints.map((item) => (
                  <div className="spa-feature-grid__item" key={item.label}>
                    <span aria-hidden="true" className="material-symbols-outlined">{item.icon}</span>
                    <strong>{item.label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">About Course</span>
            <h2 className="spa-section-title">Explore our {tnusrbCourse.shortTitle} Course</h2>
            <p className="spa-section-text">
              {tnusrbCourse.summary}
            </p>
          </div>
          <SiCourseTopicsSlider topics={tnusrbCourseTopics} />
          <div className="row justify-content-center pt---50">
            <div className="col-lg-10">
              <article className="spa-course-hero-card">
                <div className="spa-course-hero-card__body">
                  <span className="spa-section-eyebrow">{powerOfConstableSection.title}</span>
                  <h3>{powerOfConstableSection.title}</h3>
                  {powerOfConstableSection.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        className="spa-hero-band spa-hero-band--courses pt---100 pb---100"
        style={{ backgroundImage: "url(/assets/images/breadcrumbs/1.jpg)" }}
      >
        <div className="spa-hero-band__overlay" />
        <div className="container p-relative">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow spa-section-eyebrow--light">Course Highlights</span>
            <h2 className="spa-section-title spa-section-title--light">Course Features</h2>
            <p className="spa-section-text spa-section-text--light">
              Everything included in our TNUSRB Police Constable coaching programme.
            </p>
          </div>
          <div className="spa-feature-grid si-landing-feature-band pt---30">
            {tnusrbCourseFeatures.map((feature) => (
              <div className="spa-feature-grid__item" key={feature}>
                <span aria-hidden="true" className="material-symbols-outlined">verified</span>
                <strong>{feature}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spa-lizard-process pt---120 pb---120">
        <div className="container">
          <div className="spa-section-head text-center">
            <h2 className="spa-section-title">Tamil Nadu Police Constable Selection Process</h2>
            <p className="spa-section-text">
              Understand every stage of the TNUSRB Police Constable recruitment journey.
            </p>
          </div>
          <div className="spa-lizard-process__track">
            {tnusrbSelectionProcessSteps.map((step, index) => (
              <article
                className={`spa-lizard-process__step${index % 2 === 1 ? " is-right" : " is-left"}`}
                key={step.step}
              >
                <div className="spa-lizard-process__node">
                  <span aria-hidden="true" className="material-symbols-outlined">{step.icon}</span>
                  <em>{step.step}</em>
                </div>
                <div className="spa-lizard-process__card">
                  <span className="spa-lizard-process__step-label">Step {step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">TNUSRB Constable Eligibility</span>
            <h2 className="spa-section-title">Eligibility Criteria</h2>
            <p className="spa-section-text">
              Know the age, education, and reservation norms before you start your constable preparation journey.
            </p>
          </div>
          <div className="si-landing-table-wrap pt---30">
            <table className="si-landing-table">
              <thead>
                <tr>
                  <th scope="col">Criteria</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {tnusrbEligibilityRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--why pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Physical Standards</span>
            <h2 className="spa-section-title">Physical Measurement &amp; Efficiency Test</h2>
            <p className="spa-section-text">
              Daily coaching for every PET event with experienced physical trainers.
            </p>
          </div>
          <div className="si-landing-table-wrap pt---30">
            <table className="si-landing-table">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {tnusrbPhysicalEvents.map((event) => (
                  <tr key={event.title}>
                    <th scope="row">
                      <span className="si-landing-table__event">
                        <span aria-hidden="true" className="material-symbols-outlined">{event.icon}</span>
                        {event.title}
                      </span>
                    </th>
                    <td>{event.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Detailed Syllabus</span>
            <h2 className="spa-section-title">Police Constable Written Exam Syllabus</h2>
            <p className="spa-section-text">
              Topic-wise coverage aligned with TNUSRB Police Constable written examination pattern.
            </p>
          </div>
          <div className="si-landing-table-wrap pt---30">
            <table className="si-landing-table si-landing-table--syllabus">
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Topics Covered</th>
                </tr>
              </thead>
              <tbody>
                {tnusrbSyllabusSections.map((section) => (
                  <tr key={section.title}>
                    <th scope="row">{section.title}</th>
                    <td>
                      <ul className="si-landing-table__topics">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--why pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Training Methodology</span>
            <h2 className="spa-section-title">How We Train You</h2>
          </div>
          <div className="spa-feature-grid si-landing-flow-grid pt---30">
            {tnusrbTrainingFlow.map((step) => (
              <div className="spa-feature-grid__item" key={step}>
                <span aria-hidden="true" className="material-symbols-outlined">arrow_circle_right</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--why pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Practice &amp; Fitness</span>
            <h2 className="spa-section-title">Mock Tests &amp; Physical Training</h2>
            <p className="spa-section-text">
              Exam-like mock practice and daily PET coaching — explored one highlight at a time.
            </p>
          </div>
          <SiTrainingShowcase items={tnusrbTrainingSpotlights} />
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--why pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Study Materials</span>
            <h2 className="spa-section-title">Everything You Need to Prepare</h2>
          </div>
          <div className="spa-feature-grid pt---30">
            {tnusrbStudyMaterials.map((item) => (
              <div className="spa-feature-grid__item" key={item}>
                <span aria-hidden="true" className="material-symbols-outlined">menu_book</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Faculty</span>
            <h2 className="spa-section-title">Meet Our Expert Faculty</h2>
          </div>
          <div className="row g-4 pt---30">
            {tnusrbFacultyCards.map((faculty) => (
              <div className="col-lg-3 col-md-6" key={faculty.title}>
                <article className="spa-course-hero-card">
                  <div className="spa-course-hero-card__body">
                    <span aria-hidden="true" className="material-symbols-outlined si-landing-icon-title">{faculty.icon}</span>
                    <h3>{faculty.title}</h3>
                    <p>{faculty.text}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spa-testimonials-cards pt---110 pb---120">
        <div className="container">
          <div className="react__title__section-all pb---30">
            <div className="row">
              <div className="col-md-12 text-center">
                <span className="spa-section-eyebrow">Student Success</span>
                <h2 className="react__tittle">Our Successful Constable Candidates</h2>
              </div>
            </div>
          </div>
          <div className="spa-testimonials-cards__track si-landing-testimonials">
            {testimonials.slice(0, 3).map((item) => (
              <article className="spa-testimonial-card" key={item.name}>
                <div className="spa-testimonial-card__top">
                  <span className="spa-testimonial-card__quote" aria-hidden="true">“</span>
                  <div className="testimonial__ratings">
                    <em className="icon_star" />
                    <em className="icon_star" />
                    <em className="icon_star" />
                    <em className="icon_star" />
                    <em className="icon_star_alt" />
                    <span>4.9 Rating</span>
                  </div>
                </div>
                <p className="spa-testimonial-card__text">{item.text}</p>
                <div className="spa-testimonial-card__author">
                  <TestimonialAvatar name={item.name} />
                  <div className="spa-testimonial-card__author-meta">
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pt---100 pb---100">
        <div className="container">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow">Course Modes</span>
            <h2 className="spa-section-title">Available Learning Modes</h2>
          </div>
          <div className="row g-4 pt---30">
            {tnusrbLearningModes.map((mode) => (
              <div className="col-lg-4 col-md-6" key={mode.title}>
                <article className="spa-course-hero-card">
                  <div className="spa-course-hero-card__body">
                    <span aria-hidden="true" className="material-symbols-outlined si-landing-icon-title">{mode.icon}</span>
                    <h3>{mode.title}</h3>
                    <p>{mode.text}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spa-home-about pt---100 pb---100">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-6">
              <span className="spa-section-eyebrow">Fee Structure</span>
              <h2 className="spa-section-title">Affordable Course Fees</h2>
              <p className="spa-section-text" style={{ marginLeft: 0, maxWidth: "none" }}>
                Flexible payment support for serious TNUSRB Police Constable aspirants across Tamil Nadu.
              </p>
              <ul className="spa-main-hero__highlights si-landing-checklist si-landing-checklist--light">
                {tnusrbFeeHighlights.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {tnusrbBatches.map((batch) => (
                  <div className="col-md-6" key={batch.title}>
                    <article className="spa-course-hero-card">
                      <div className="spa-course-hero-card__body">
                        <h3>{batch.title}</h3>
                        <p>{batch.time}</p>
                        <span className="si-landing-batch-mode">{batch.mode}</span>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="accordion__area spa-faq-expanded p-relative pt---110 pb---100">
        <div className="accordion__shape">
          <img className="accordion__shape-1" src="/assets/images/acc.png" alt="" aria-hidden="true" />
          <img className="accordion__shape-1a" src="/assets/images/banner2/shape_01.png" alt="" aria-hidden="true" />
        </div>
        <div className="container">
          <div className="spa-faq-expanded__layout">
            <aside className="spa-faq-expanded__sidebar">
              <div className="accordion__wrapper-1">
                <h2>
                  Frequently Asked <br />Questions
                </h2>
                <p>{academy.description}</p>
              </div>
            </aside>
            <div className="spa-faq-expanded__scroll" tabIndex={0} aria-label="FAQ answers">
              <div className="spa-faq-expanded__list">
                {tnusrbFaqs.map((item, index) => (
                  <article className="spa-faq-expanded__item" key={`${item.question}-${index}`}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
