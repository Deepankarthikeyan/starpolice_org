import Link from "next/link";
import SiCourseTopicsSlider from "./SiCourseTopicsSlider";
import { academy, contact, stats } from "../lib/star-content";

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const navyTrustPoints = [
  { icon: "sailing", label: "Maritime career preparation" },
  { icon: "school", label: "Written exam and GK support" },
  { icon: "fitness_center", label: "Physical fitness coaching" },
  { icon: "menu_book", label: "Current affairs & reasoning support" },
  { icon: "quiz", label: "Practice tests and mock sessions" },
  { icon: "cast_for_education", label: "Online learning resources" },
];

const navyCourseTopics = [
  {
    title: "Navy Recruitment Overview",
    text: "Understand the recruitment stages, eligibility norms, documentation needs, and the service expectations for Indian Navy aspirants.",
    icon: "badge",
    image: "/assets/images/courses/course-indian-navy.jpg",
  },
  {
    title: "Written Exam Preparation",
    text: "Get guided support for general awareness, reasoning, arithmetic, and current affairs required for the written test.",
    icon: "menu_book",
    image: "/assets/images/courses/course-indian-navy.jpg",
  },
  {
    title: "Physical Fitness & Drill",
    text: "Focus on stamina, endurance, and physical conditioning needed for fitness rounds and service readiness.",
    icon: "fitness_center",
    image: "/assets/images/courses/course-indian-navy.jpg",
  },
  {
    title: "Medical & Eligibility Readiness",
    text: "Stay prepared for medical standards, document verification, and other guideline-based checks in the recruitment process.",
    icon: "health_and_safety",
    image: "/assets/images/courses/course-indian-navy.jpg",
  },
  {
    title: "Leadership & Personality Traits",
    text: "Develop confidence, professionalism, and communication that support success in naval service and interviews.",
    icon: "record_voice_over",
    image: "/assets/images/courses/course-indian-navy.jpg",
  },
  {
    title: "Online Study Resources",
    text: "Access updated notes, practice sets, and online learning support for revision and steady preparation.",
    icon: "computer",
    image: "/assets/images/courses/course-indian-navy.jpg",
  },
];

const navyCourseFeatures = [
  "Navy-focused study planning",
  "Written exam support",
  "Physical fitness guidance",
  "Mock tests and practice papers",
  "Current affairs and reasoning support",
  "Online study resources",
  "Eligibility and document support",
  "Interview and personality coaching",
];

const navySelectionSteps = [
  { step: 1, title: "Registration", text: "Complete registration and prepare all required documents for the recruitment process.", icon: "edit_note" },
  { step: 2, title: "Written Examination", text: "Attend the written test with preparation support in general awareness, reasoning, and arithmetic.", icon: "quiz" },
  { step: 3, title: "Physical Fitness Test", text: "Prepare for fitness standards and endurance evaluation with structured training plans.", icon: "directions_run" },
  { step: 4, title: "Medical Examination", text: "Get ready for medical checks and health verification as per Navy requirements.", icon: "health_and_safety" },
  { step: 5, title: "Document Verification", text: "Verify certificates and other official records before final clearance.", icon: "verified" },
  { step: 6, title: "Final Allocation", text: "Prepare for final selection and transition into training with step-by-step support.", icon: "directions_boat" },
];

const navyEligibilityRows = [
  { label: "Age", value: "As per the latest Indian Navy recruitment notification and official guidelines" },
  { label: "Education", value: "Minimum qualification as per the current Navy recruitment announcement" },
  { label: "Physical Standards", value: "Height, weight, and fitness values must meet the latest official criteria" },
  { label: "Nationality", value: "Indian citizen as per the official recruitment eligibility norms" },
  { label: "Other Requirements", value: "Medical fitness and document readiness are essential for final selection" },
];

const navyPhysicalEvents = [
  { title: "Running", text: "Endurance and sprint preparation support fitness rounds and physical conditioning standards.", icon: "directions_run" },
  { title: "Swimming", text: "Water confidence, stamina, and survival preparation form an important part of maritime readiness.", icon: "pool" },
  { title: "Push-ups", text: "Upper body strength training improves basic fitness performance and endurance.", icon: "fitness_center" },
  { title: "Squats", text: "Lower-body conditioning supports overall stamina and physical resilience.", icon: "sports_gymnastics" },
];

export default function NavyLandingPage() {
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
                <span className="spa-main-hero__eyebrow">Indian Navy</span>
                <h1 className="spa-main-hero__title">Indian Navy Preparation Programme</h1>
                <p className="spa-main-hero__text">
                  Prepare for the Indian Navy with focused guidance on written exams, physical fitness, medical readiness, and online study resources.
                </p>
                <ul className="spa-main-hero__highlights">
                  <li><span aria-hidden="true" className="material-symbols-outlined">check_circle</span>Structured Navy preparation</li>
                  <li><span aria-hidden="true" className="material-symbols-outlined">check_circle</span>Written exam and GK support</li>
                  <li><span aria-hidden="true" className="material-symbols-outlined">check_circle</span>Physical readiness and drill guidance</li>
                  <li><span aria-hidden="true" className="material-symbols-outlined">check_circle</span>Online materials and practice batches</li>
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
                <img src="/assets/images/courses/course-indian-navy.jpg" alt="Indian Navy coaching" />
                <h3>Indian Navy Coaching Support</h3>
                <p>Written exam · Physical training · Medical readiness · Online resources</p>
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
              <h2 className="spa-section-title">Why Star Police Academy for Navy Preparation?</h2>
              <p className="spa-section-text" style={{ marginLeft: 0, maxWidth: "none" }}>
                We guide aspirants with an organized preparation plan that covers written study, physical training, medical readiness, and online resources for the Indian Navy pathway.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="spa-feature-grid">
                {navyTrustPoints.map((item) => (
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
            <h2 className="spa-section-title">Indian Navy Course Structure</h2>
            <p className="spa-section-text">
              A complete preparation model for Navy aspirants with structured guidance and online resources.
            </p>
          </div>
          <SiCourseTopicsSlider topics={navyCourseTopics} />
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--courses pt---100 pb---100" style={{ backgroundImage: "url(/assets/images/breadcrumbs/1.jpg)" }}>
        <div className="spa-hero-band__overlay" />
        <div className="container p-relative">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow spa-section-eyebrow--light">Course Highlights</span>
            <h2 className="spa-section-title spa-section-title--light">Course Features</h2>
            <p className="spa-section-text spa-section-text--light">
              Key support pillars for the Indian Navy preparation journey.
            </p>
          </div>
          <div className="spa-feature-grid si-landing-feature-band pt---30">
            {navyCourseFeatures.map((feature) => (
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
            <h2 className="spa-section-title">Indian Navy Selection Journey</h2>
            <p className="spa-section-text">
              A clear view of the stages that aspirants must prepare for in the Navy selection process.
            </p>
          </div>
          <div className="spa-lizard-process__track">
            {navySelectionSteps.map((step, index) => (
              <article className={`spa-lizard-process__step${index % 2 === 1 ? " is-right" : " is-left"}`} key={step.step}>
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
            <span className="spa-section-eyebrow">Navy Eligibility</span>
            <h2 className="spa-section-title">Eligibility Overview</h2>
            <p className="spa-section-text">
              Key eligibility points to keep in mind before starting your Indian Navy preparation plan.
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
                {navyEligibilityRows.map((row) => (
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
            <h2 className="spa-section-title">Physical Readiness Focus</h2>
            <p className="spa-section-text">
              Daily preparation for basic fitness expectations with online follow-up support.
            </p>
          </div>
          <div className="si-landing-table-wrap pt---30">
            <table className="si-landing-table">
              <thead>
                <tr>
                  <th scope="col">Focus Area</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {navyPhysicalEvents.map((event) => (
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
    </div>
  );
}
