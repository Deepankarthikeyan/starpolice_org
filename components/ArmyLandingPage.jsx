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

const armyTrustPoints = [
  { icon: "military_tech", label: "Agnipath-focused preparation" },
  { icon: "school", label: "Written exam guidance" },
  { icon: "fitness_center", label: "Physical fitness training" },
  { icon: "menu_book", label: "Current affairs & GK support" },
  { icon: "quiz", label: "Mock tests and practice sets" },
  { icon: "cast_for_education", label: "Online learning resources" },
];

const armyCourseTopics = [
  {
    title: "Agnipath Selection Overview",
    text: "Understand the recruitment stages, eligibility, documentation, and service expectations before you begin your army preparation journey.",
    icon: "badge",
    image: "/assets/images/courses/course-indian-army.jpg",
  },
  {
    title: "Written Exam Preparation",
    text: "Build strong fundamentals in general knowledge, reasoning, arithmetic, and current affairs with guided study material and revision plans.",
    icon: "menu_book",
    image: "/assets/images/courses/course-indian-army.jpg",
  },
  {
    title: "Physical Fitness & Drill",
    text: "Improve running stamina, endurance, push-ups, and overall physical readiness through structured training schedules.",
    icon: "fitness_center",
    image: "/assets/images/courses/course-indian-army.jpg",
  },
  {
    title: "Medical & Eligibility Readiness",
    text: "Stay prepared for medical standards, document verification, and other eligibility checks required at various selection stages.",
    icon: "health_and_safety",
    image: "/assets/images/courses/course-indian-army.jpg",
  },
  {
    title: "Leadership & Personality Traits",
    text: "Develop discipline, confidence, communication, and temperament required for a strong service career in the armed forces.",
    icon: "record_voice_over",
    image: "/assets/images/courses/course-indian-army.jpg",
  },
  {
    title: "Online Study Resources",
    text: "Access updated notes, video guidance, practice questions, and revision support through online learning resources.",
    icon: "computer",
    image: "/assets/images/courses/course-indian-army.jpg",
  },
];

const armyCourseFeatures = [
  "Agnipath-focused study planning",
  "Updated written exam support",
  "Physical training guidance",
  "Mock tests and practice papers",
  "Current affairs and GK support",
  "Online study resources",
  "Eligibility and document support",
  "Interview and personality coaching",
];

const armySelectionSteps = [
  { step: 1, title: "Registration", text: "Complete the registration and prepare all documents required for the recruitment process.", icon: "edit_note" },
  { step: 2, title: "Written Examination", text: "Appear for the written round with preparation support in reasoning, arithmetic, GK, and current affairs.", icon: "quiz" },
  { step: 3, title: "Physical Fitness Test", text: "Practice stamina, running, and physical readiness for the fitness round.", icon: "directions_run" },
  { step: 4, title: "Medical Examination", text: "Get ready for medical checks and health verification as per service standards.", icon: "health_and_safety" },
  { step: 5, title: "Document Verification", text: "Verify certificates, identity proof, and all required paperwork before final clearance.", icon: "verified" },
  { step: 6, title: "Final Allocation", text: "Prepare for final selection and training allocation with complete guidance and support.", icon: "military_tech" },
];

const armyEligibilityRows = [
  { label: "Age", value: "As per the latest Agnipath recruitment notification and service guidelines" },
  { label: "Education", value: "Minimum qualification as per the current Army recruitment notification" },
  { label: "Physical Standards", value: "Height, weight, and fitness values must meet the latest official criteria" },
  { label: "Nationality", value: "Indian citizen as per the official recruitment eligibility norms" },
  { label: "Other Requirements", value: "Medical fitness and document readiness are essential for final selection" },
];

const armyPhysicalEvents = [
  { title: "Running", text: "Endurance and sprint preparation for fitness rounds and physical efficiency standards.", icon: "directions_run" },
  { title: "Push-ups", text: "Upper body strength preparation enhances performance in basic physical fitness routines.", icon: "fitness_center" },
  { title: "Sit-ups", text: "Core strength and stamina training improve overall physical readiness.", icon: "self_improvement" },
  { title: "Squats", text: "Lower-body conditioning supports endurance and agility during training activities.", icon: "sports_gymnastics" },
];

export default function ArmyLandingPage() {
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
                <span className="spa-main-hero__eyebrow">Agnipath · Indian Army</span>
                <h1 className="spa-main-hero__title">Indian Army Agnipath Preparation Programme</h1>
                <p className="spa-main-hero__text">
                  Prepare for the Indian Army with focused guidance on written exams, physical fitness, medical readiness, and online study resources.
                </p>
                <ul className="spa-main-hero__highlights">
                  <li><span aria-hidden="true" className="material-symbols-outlined">check_circle</span>Structured Agnipath preparation</li>
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
                <img src="/assets/images/courses/course-indian-army.jpg" alt="Indian Army Agnipath coaching" />
                <h3>Indian Army Agnipath Coaching Support</h3>
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
              <h2 className="spa-section-title">Why Star Police Academy for Army Preparation?</h2>
              <p className="spa-section-text" style={{ marginLeft: 0, maxWidth: "none" }}>
                We guide aspirants with an organized preparation plan that covers written study, physical training, medical readiness, and online resources for the Agnipath pathway.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="spa-feature-grid">
                {armyTrustPoints.map((item) => (
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
            <h2 className="spa-section-title">Indian Army Agnipath Course Structure</h2>
            <p className="spa-section-text">
              A complete preparation model for Agnipath aspirants with structured guidance and online resources.
            </p>
          </div>
          <SiCourseTopicsSlider topics={armyCourseTopics} />
        </div>
      </section>

      <section className="spa-hero-band spa-hero-band--courses pt---100 pb---100" style={{ backgroundImage: "url(/assets/images/breadcrumbs/1.jpg)" }}>
        <div className="spa-hero-band__overlay" />
        <div className="container p-relative">
          <div className="spa-section-head text-center">
            <span className="spa-section-eyebrow spa-section-eyebrow--light">Course Highlights</span>
            <h2 className="spa-section-title spa-section-title--light">Course Features</h2>
            <p className="spa-section-text spa-section-text--light">
              Key support pillars for the Agnipath preparation journey.
            </p>
          </div>
          <div className="spa-feature-grid si-landing-feature-band pt---30">
            {armyCourseFeatures.map((feature) => (
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
            <h2 className="spa-section-title">Indian Army Selection Journey</h2>
            <p className="spa-section-text">
              A clear view of the stages that aspirants must prepare for in the Agnipath selection process.
            </p>
          </div>
          <div className="spa-lizard-process__track">
            {armySelectionSteps.map((step, index) => (
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
            <span className="spa-section-eyebrow">Agnipath Eligibility</span>
            <h2 className="spa-section-title">Eligibility Overview</h2>
            <p className="spa-section-text">
              Key eligibility points to keep in mind before starting your Indian Army preparation plan.
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
                {armyEligibilityRows.map((row) => (
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
                {armyPhysicalEvents.map((event) => (
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
