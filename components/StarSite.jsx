import Head from "next/head";
import Link from "next/link";
import { buildPageSeo } from "../lib/star-seo";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AUTO_SLIDER_INTERVAL_MS, useAutoSliderInterval, useAutoSliderPause } from "../lib/useAutoSlider";
import SiLandingPage from "./SiLandingPage";
import TnusrbLandingPage from "./TnusrbLandingPage";
import ArmyLandingPage from "./ArmyLandingPage";
import NavyLandingPage from "./NavyLandingPage";
import AirForceLandingPage from "./AirForceLandingPage";
import RpfLandingPage from "./RpfLandingPage";
import CapfLandingPage from "./CapfLandingPage";
import {
  academy,
  contact,
  courses,
  courseNavItems,
  faqs,
  features,
  facilitiesItems,
  facultyMembers,
  heroHighlights,
  latestBlogArticles,
  notificationItems,
  schedulePdfUrl,
  physicalTrainingItems,
  questionPapers,
  recruitmentUpdates,
  registrationCourses,
  selectionProcessSteps,
  stats,
  studentResults,
  terms,
  testimonials,
  toppersAchievers2026,
  trainingSteps,
  whyChooseFeatures,
  winnerCarouselItems,
  youtubeVideos,
} from "../lib/star-content";
import { resolveStarRoute } from "../lib/star-routes";

function SiteLink({ href = "/", onClick, children, className, ...rest }) {
  const pathname = typeof href === "string" ? href.split("?")[0].split("#")[0] : href;
  const isNavigable = resolveStarRoute(pathname) !== null;

  if (isNavigable) {
    return (
      <Link href={href} onClick={onClick} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href="#"
      className={className}
      aria-disabled="true"
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

function normalizeNavPath(path) {
  if (!path) {
    return "/";
  }

  const value = path.split("?")[0].split("#")[0];
  if (!value || value === "/index") {
    return "/";
  }

  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

function isNavPathMatch(currentPath, targetPath) {
  const current = normalizeNavPath(currentPath);
  const target = normalizeNavPath(targetPath);

  if (target === "/") {
    return current === "/";
  }

  return current === target || current.startsWith(`${target}/`);
}

function navLinkClassName(currentPath, href) {
  return isNavPathMatch(currentPath, href) ? "react-current-page" : undefined;
}

function isNavSectionActive(currentPath, paths) {
  return paths.some((path) => isNavPathMatch(currentPath, path));
}

const headerNavSections = {
  courses: ["/courses", "/training", ...courseNavItems.map((item) => item.href)],
  notifications: [
    "/star-police-academy-current-affairs",
    "/star-police-academy-youtube",
    "/star-police-academy-test-batches",
    "/notification",
    "/youtube",
    "/test-batch",
  ],
  training: [
    "/star-police-academy-toppers-and-achievers",
    "/star-police-academy-training-materials",
    "/star-police-academy-question-papers",
    "/star-police-academy-answer-keys",
    "/toppers",
    "/materials",
    "/questions",
    "/ansewrkey",
  ],
};

const aboutLearningIcons = [
  "/assets/images/topics/icon.png",
  "/assets/images/topics/icon2.png",
  "/assets/images/topics/icon3.png",
];

const aboutCounterItems = [
  {
    icon: "/assets/images/counter/1.png",
    value: stats[0].value.replace("+", ""),
    suffix: "+",
    label: stats[0].label,
    detail: "Over a decade of trusted TNUSRB, SI and police exam coaching in Vellore.",
  },
  {
    icon: "/assets/images/counter/2.png",
    value: stats[1].value.replace("+", ""),
    suffix: "+",
    label: stats[1].label,
    detail: "Aspirants trained with classroom guidance, tests and physical preparation.",
  },
  {
    icon: "/assets/images/counter/3.png",
    value: stats[2].value.replace("+", ""),
    suffix: "+",
    label: stats[2].label,
    detail: "Students supported into police, SI and defence service selections.",
  },
  {
    icon: "/assets/images/counter/4.png",
    value: stats[3].value.replace("+", ""),
    suffix: "+",
    label: stats[3].label,
    detail: "Subject experts and trainers from across Tamil Nadu on our faculty.",
  },
];

const aboutLearningCards = [
  {
    title: "Online/Offline Classes",
    text: "Flexible police exam coaching with classroom and online support for TNUSRB, SI and defence aspirants.",
  },
  {
    title: "Daily Online Exams",
    text: "Regular practice tests and performance tracking help students prepare better for written examinations.",
  },
  {
    title: "Toppers and Achievers",
    text: "The outstanding success of our students are our proudest testimony and motivation.",
  },
];

const aboutInstructors = [
  {
    name: academy.founder,
    role: academy.founderRole,
    image: "/assets/images/about/instructors/avatar-01.jpg",
  },
  {
    name: "Subject Expert Faculty",
    role: "TNUSRB Written Exam",
    image: "/assets/images/about/instructors/about-02.png",
  },
  {
    name: "Physical Training Team",
    role: "Fitness & PET Training",
    image: "/assets/images/about/instructors/history-01.jpg",
  },
  {
    name: "Mentoring Team",
    role: "Interview & Guidance",
    image: "/assets/images/about/instructors/history-04.jpg",
  },
];

const homeTopics = features.map((feature, index) => ({
  title: feature.title,
  courses: feature.text,
  icon: `/assets/images/topics/${index + 1}.svg`,
}));

const homeCourseFilterTags = [
  ["filter2", "filter3"],
  ["filter5", "filter1"],
  ["filter3", "filter2"],
  ["filter4", "filter6"],
  ["filter6", "filter3"],
  ["filter5", "filter2"],
];

const courseFilterTabs = [
  { label: "See All", value: "*" },
  { label: "Trending", value: "filter1" },
  { label: "Featured", value: "filter2" },
  { label: "Popularity", value: "filter3" },
  { label: "Web Design", value: "filter4" },
];

const homeCourses = courses.slice(0, 6).map((course, index) => ({
  key: course.key,
  title: course.summary,
  category: course.shortTitle,
  image: course.image || `/assets/images/course-filter/${index + 1}.jpg`,
  lessons: "Expert Coaching",
  students: `${stats[1].value} Students`,
  review: "4.8 review",
  author: academy.founder,
  price: "Apply",
  filters: homeCourseFilterTags[index] || ["filter1"],
}));

const homeInstructors = [
  ...aboutInstructors,
  {
    name: "Interview Panel Team",
    role: "Mentoring Team",
    avatarIcon: "groups",
  },
  {
    name: "Admissions Team",
    role: "Counseling Support",
    avatarIcon: "support_agent",
  },
];

const homeBlogCards = notificationItems.slice(0, 4).map((item, index) => ({
  date: item.date,
  category: item.category,
  title: item.title,
  image: courses[index]?.image || `/assets/images/blog/${index + 1}.jpg`,
  author: academy.name,
  href: item.href,
}));

function SiteHead({ seo }) {
  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content={seo.author} />
      <meta name="geo.region" content={seo.geoRegion} />
      <meta name="geo.placename" content={seo.geoPlaceName} />
      <meta name="language" content={seo.language} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={seo.canonicalUrl} />
      <link rel="shortcut icon" type="image/x-icon" href={seo.favicon} />

      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:site_name" content={seo.siteName} />
      <meta property="og:logo" content={seo.logo} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage} />

      {seo.schemas.map((schema, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={`schema-${index}`}
          type="application/ld+json"
        />
      ))}

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Livvic:wght@400;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" type="text/css" href="/assets/css/bootstrap.min.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/menus.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/animate.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/owl.carousel.css" />
      <link rel="stylesheet" type="text/css" href="/assets/fonts/elegant-icon.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/all.min.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/magnific-popup.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/animations.css" />
      <link rel="stylesheet" type="text/css" href="/style.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/custom-spacing.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/responsive.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/header-sticky.css" />
      <link rel="stylesheet" type="text/css" href="/assets/css/brand-theme.css" />
    </Head>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function encodeAssetPath(assetPath) {
  return assetPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function InstructorPortrait({ instructor }) {
  if (instructor.avatarIcon) {
    return (
      <div className="spa-user-avatar spa-user-avatar--instructor" aria-label={instructor.name}>
        <span aria-hidden="true" className="material-symbols-outlined">
          {instructor.avatarIcon}
        </span>
      </div>
    );
  }

  return <img src={instructor.image} alt={instructor.name} />;
}

function TestimonialAvatar({ name, size = "lg" }) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <span className={`spa-user-avatar spa-user-avatar--${size}`} aria-label={name}>
      <span aria-hidden="true" className="material-symbols-outlined">
        person
      </span>
      <span aria-hidden="true" className="spa-user-avatar__initial">
        {initial}
      </span>
    </span>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function MenuChevronDownIcon() {
  return (
    <svg
      className="exact-menu-arrow"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function NavDropdown({ label, href, menuKey, expandedMenu, onToggle, onClose, isActive, disableNavigation = false, children }) {
  const isExpanded = expandedMenu === menuKey;

  return (
    <li
      className={`exact-menu-has-dropdown${menuKey === "courses" ? " exact-menu-courses-dropdown" : ""} ${isExpanded ? "exact-menu-expanded" : ""}${isActive ? " menu-active" : ""}`}
    >
      <div className="exact-menu-link-row">
        <SiteLink
          href={href}
          onClick={(event) => {
            if (disableNavigation) {
              event.preventDefault();
              onToggle(menuKey);
              return;
            }

            onClose();
          }}
          className={isActive ? "react-current-page" : undefined}
        >
          {label}
          <MenuChevronDownIcon />
        </SiteLink>
        <button
          type="button"
          className="exact-menu-dropdown-toggle"
          aria-label={`Toggle ${label} submenu`}
          aria-expanded={isExpanded}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggle(menuKey);
          }}
        >
          <MenuChevronDownIcon />
        </button>
      </div>
      <ul className="sub-menu">{children}</ul>
    </li>
  );
}

function Header() {
  const router = useRouter();
  const currentPath = normalizeNavPath(router.asPath);
  const [open, setOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [dropdownPaused, setDropdownPaused] = useState(false);

  const closeNavigation = () => {
    setOpen(false);
    setExpandedMenu(null);
    setDropdownPaused(true);

    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const resumeDropdowns = () => {
    setDropdownPaused(false);
  };

  const toggleSubmenu = (menuKey) => {
    setExpandedMenu((current) => (current === menuKey ? null : menuKey));
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header
      id="react-header"
      className={`react-header react-header-two exact-home-header${dropdownPaused ? " is-dropdown-paused" : ""}`}
    >
      {open ? (
        <button
          type="button"
          className="exact-home-header__backdrop"
          aria-label="Close navigation"
          onClick={closeNavigation}
        />
      ) : null}
      <div className="menu-part">
        <div className="container">
          <div className="react-main-menu">
            <nav>
              <div className="menu-toggle">
                <div className="logo">
                  <SiteLink href="/" className="logo-text" onClick={closeNavigation}>
                    <img
                      className="star-brand-logo"
                      src={academy.logo}
                      alt="Star Police Academy Vellore logo"
                      width={347}
                      height={144}
                      fetchPriority="high"
                    />
                  </SiteLink>
                </div>
                <button
                  type="button"
                  id="menu-btn"
                  className={open ? "back__close" : ""}
                  aria-label="Toggle navigation"
                  aria-expanded={open}
                  onClick={() => setOpen((value) => !value)}
                >
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                </button>
              </div>
              <div className={`react-inner-menus exact-home-menus ${open ? "is-open" : ""}`}>
                <ul
                  id="backmenu"
                  className="react-menus react-sub-shadow"
                  onMouseLeave={resumeDropdowns}
                >
                  <li className={isNavPathMatch(currentPath, "/") ? "menu-active" : undefined}>
                    <SiteLink href="/" onClick={closeNavigation} className={navLinkClassName(currentPath, "/")}>
                      Home
                    </SiteLink>
                  </li>
                  <li className={isNavPathMatch(currentPath, "/about") ? "menu-active" : undefined}>
                    <SiteLink href="/about" onClick={closeNavigation} className={navLinkClassName(currentPath, "/about")}>
                      About
                    </SiteLink>
                  </li>
                  <NavDropdown
                    label="Courses"
                    href="/courses"
                    disableNavigation
                    menuKey="courses"
                    expandedMenu={expandedMenu}
                    onToggle={toggleSubmenu}
                    onClose={closeNavigation}
                    isActive={isNavSectionActive(currentPath, headerNavSections.courses)}
                  >
                    {courseNavItems.map((item) => (
                      <li key={item.label} className={isNavPathMatch(currentPath, item.href) ? "menu-active" : undefined}>
                        <SiteLink
                          href={item.href}
                          onClick={closeNavigation}
                          className={navLinkClassName(currentPath, item.href)}
                        >
                          {item.label}
                        </SiteLink>
                      </li>
                    ))}
                  </NavDropdown>
                  <NavDropdown
                    label="Notifications"
                    href="/star-police-academy-current-affairs"
                    menuKey="notifications"
                    expandedMenu={expandedMenu}
                    onToggle={toggleSubmenu}
                    onClose={closeNavigation}
                    isActive={isNavSectionActive(currentPath, headerNavSections.notifications)}
                  >
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-current-affairs") ||
                        isNavPathMatch(currentPath, "/notification")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-current-affairs"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-current-affairs")}
                      >
                        Current Affairs
                      </SiteLink>
                    </li>
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-youtube") ||
                        isNavPathMatch(currentPath, "/youtube")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-youtube"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-youtube")}
                      >
                        Youtube Channel
                      </SiteLink>
                    </li>
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-test-batches") ||
                        isNavPathMatch(currentPath, "/test-batch")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-test-batches"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-test-batches")}
                      >
                        Test Batches
                      </SiteLink>
                    </li>
                  </NavDropdown>
                  <NavDropdown
                    label="Training"
                    href="/star-police-academy-toppers-and-achievers"
                    menuKey="training"
                    expandedMenu={expandedMenu}
                    onToggle={toggleSubmenu}
                    onClose={closeNavigation}
                    isActive={isNavSectionActive(currentPath, headerNavSections.training)}
                  >
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-toppers-and-achievers") ||
                        isNavPathMatch(currentPath, "/toppers")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-toppers-and-achievers"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-toppers-and-achievers")}
                      >
                        Toppers and Achievers
                      </SiteLink>
                    </li>
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-training-materials") ||
                        isNavPathMatch(currentPath, "/materials")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-training-materials"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-training-materials")}
                      >
                        Training Materials
                      </SiteLink>
                    </li>
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-question-papers") ||
                        isNavPathMatch(currentPath, "/questions")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-question-papers"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-question-papers")}
                      >
                        Question papers
                      </SiteLink>
                    </li>
                    <li
                      className={
                        isNavPathMatch(currentPath, "/star-police-academy-answer-keys") ||
                        isNavPathMatch(currentPath, "/ansewrkey")
                          ? "menu-active"
                          : undefined
                      }
                    >
                      <SiteLink
                        href="/star-police-academy-answer-keys"
                        onClick={closeNavigation}
                        className={navLinkClassName(currentPath, "/star-police-academy-answer-keys")}
                      >
                        Answer Keys
                      </SiteLink>
                    </li>
                  </NavDropdown>
                  <li className={isNavPathMatch(currentPath, "/contact") ? "menu-active" : undefined}>
                    <SiteLink href="/contact-us" onClick={closeNavigation} className={navLinkClassName(currentPath, "/contact-us")}>
                      Contact Us
                    </SiteLink>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer id="react-footer" className="react-footer react-footer-two pt---120">
      <div className="footer-top">
        <div className="container">
          <div className="footer-top-cta">
            <div className="row">
              <div className="col-lg-7">
                <h4>Star Police Academy</h4>
                <h3>
                  Ready to dive in? <br /> Start your police exam coaching today.
                </h3>
              </div>
              <div className="col-lg-5 text-right">
                <SiteLink href="/contact-us">
                  Contact Us <ArrowIcon />
                </SiteLink>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 md-mb-30">
              <div className="footer-widget footer-widget-1">
                <div className="footer-logo">
                  <SiteLink href="/" className="logo-text">
                    <img
                      className="star-brand-logo star-brand-logo--footer"
                      src={academy.footerLogo}
                      alt="Star Police Academy Vellore logo"
                      width={347}
                      height={144}
                      loading="lazy"
                    />
                  </SiteLink>
                </div>
                <h5 className="footer-subtitle">{academy.aboutIntro}</h5>
                <ul className="footer-address">
                  <li>
                    <PhoneIcon />
                    <a href={`tel:${contact.phonePrimary.replace(/\s/g, "")}`}>{contact.phonePrimary}</a>
                  </li>
                  <li>
                    <MailIcon />
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 md-mb-30">
              <div className="footer-widget footer-widget-2">
                <h3 className="footer-title">About Us</h3>
                <div className="footer-menu">
                  <ul>
                    <li><SiteLink href="/">Home</SiteLink></li>
                    <li><SiteLink href="/about">About</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-current-affairs">Current Affairs</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-youtube">Youtube Channel</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-test-batches">Test Batches</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-toppers-and-achievers">Toppers and Achievers</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-training-materials">Training Materials</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-question-papers">Question papers</SiteLink></li>
                    <li><SiteLink href="/star-police-academy-answer-keys">Answer Keys</SiteLink></li>
                    <li><SiteLink href="/contact-us">Contact Us</SiteLink></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4 md-mb-30">
              <div className="footer-widget footer-widget-3">
                <h3 className="footer-title">Courses</h3>
                <div className="footer-menu">
                  <ul>
                    {courseNavItems.map((item) => (
                      <li key={item.href}>
                        <SiteLink href={item.href}>{item.label}</SiteLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright">
        <div className="container">
          <div className="react-copy-left">
            © {new Date().getFullYear()} <SiteLink href="/">Star Police Academy.</SiteLink> All Rights Reserved
          </div>
          <div className="react-copy-right">
            <ul className="social-links">
              <li className="follow">Follow us</li>
              <li>
                <a href="#" aria-label="Facebook">
                  <span aria-hidden="true" className="social_facebook" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Twitter">
                  <span aria-hidden="true" className="social_twitter" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn">
                  <span aria-hidden="true" className="social_linkedin" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SectionTitle({ eyebrow, title, text, center = true }) {
  return (
    <div className={`star-section-title ${center ? "text-center" : ""}`}>
      {eyebrow ? <span className="star-eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function pageBannerBackgroundStyle() {
  return {
    backgroundImage: `linear-gradient(180deg, rgba(3, 21, 82, 0.82) 0%, rgba(4, 28, 107, 0.68) 50%, rgba(2, 15, 58, 0.82) 100%), url(${academy.homeHeroBackground || academy.heroBackground})`,
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    minHeight: "380px",
    overflow: "visible",
    position: "relative",
  };
}

function ExactBreadcrumb({ title, className = "" }) {
  const breadcrumbClassName = ["react-breadcrumbs", "exact-about-breadcrumb", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={breadcrumbClassName}>
      <div className="breadcrumbs-wrap" style={pageBannerBackgroundStyle()}>
        <div className="breadcrumbs-overlay" />
        <div className="breadcrumbs-inner">
          <div className="container">
            <div className="breadcrumbs-text">
              <span className="breadcrumbs-eyebrow">Best Coaching Centre in Tamil Nadu</span>
              <h1 className="breadcrumbs-title">{title}</h1>
              <div className="back-nav">
                <ul>
                  <li>
                    <SiteLink href="/">Home</SiteLink>
                  </li>
                  <li>{title}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ title }) {
  return (
    <div className="react-breadcrumbs star-breadcrumbs exact-about-breadcrumb">
      <div className="breadcrumbs-wrap" style={pageBannerBackgroundStyle()}>
        <div className="breadcrumbs-overlay" />
        <div className="breadcrumbs-inner">
          <div className="container">
            <div className="breadcrumbs-text">
              <h1 className="breadcrumbs-title">{title}</h1>
              <div className="back-nav">
                <ul>
                  <li>
                    <SiteLink href="/">Home</SiteLink>
                  </li>
                  <li>{title}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="react-slider-part star-hero">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <span className="slider-pretitle">{academy.heroSlides[0].eyebrow}</span>
            <h1 className="slider-title">
              {academy.heroSlides[0].title}
              <br />
              <em>Star Police Academy</em>
            </h1>
            <p>{academy.heroSlides[0].text}</p>
            <div className="star-hero-actions">
              <SiteLink href={academy.heroSlides[0].href || "/contact-us"} className="react-btn">
                {academy.heroSlides[0].cta}
              </SiteLink>
              <SiteLink href="/courses" className="react-btn-border">
                How IT Works
              </SiteLink>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="star-hero-card">
              <h3>{academy.tagline}</h3>
              <p>{academy.description}</p>
              <ul>
                <li>TNUSRB Police Constable</li>
                <li>TNUSRB Sub Inspector</li>
                <li>Army, Navy, Air Force, RPF and CAPF Courses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCards() {
  return (
    <section className="react_popular_topics pt---100 pb---70">
      <div className="container">
        <SectionTitle
          eyebrow="//Police Exam Training"
          title="Star Police Academy"
          text="We are one of the best training center for Police competitive exams over 15 years."
        />
        <div className="row">
          {features.map((feature) => (
            <div className="col-lg-3 col-md-6" key={feature.title}>
              <div className="star-card star-feature-card">
                <span className="star-card-icon">{feature.title.charAt(0)}</span>
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
                <SiteLink href="/about">Read More</SiteLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ detailed = false }) {
  return (
    <section className="about__area about__area_one p-relative pt---100 pb---100 star-about">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="star-about-panel">
              <span>//About Us</span>
              <h2>Tamil Nadu's Leading TNUSRB SI & Police Coaching Centre</h2>
              <p>{academy.aboutIntro}</p>
              <div className="star-founder">
                <strong>{academy.founder}</strong>
                <em>{academy.founderRole}</em>
              </div>
              <div className="star-about-badges">
                <span>Experts Around Tamilnadu</span>
                <span>Best Coaching Centres</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="star-history">
              {(detailed ? academy.aboutDetails : academy.aboutDetails.slice(0, 1)).map((item) => (
                <article key={item.title}>
                  <span>{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseGrid({ limit }) {
  const visibleCourses = limit ? courses.slice(0, limit) : courses;

  return (
    <section className="react-course-filter back__course__area pb---100 pt---100 star-courses">
      <div className="container">
        <SectionTitle
          eyebrow="//Exams Training//"
          title="“Being with a WINNER, make you a WINNER”."
          text="Focused coaching for TNUSRB, Police, Defence and central force aspirants."
        />
        <div className="row">
          {visibleCourses.map((course) => (
            <div className="col-lg-4 col-md-6" key={course.key}>
              <article className="star-card star-course-card">
                <img src={course.image} alt={course.shortTitle} />
                <div className="star-course-card-content">
                  <h3>{course.shortTitle}</h3>
                  <p>{course.summary}</p>
                  <SiteLink href={`/${course.key}`}>Read More</SiteLink>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBlock() {
  return (
    <section className="count__area star-stats">
      <div className="container">
        <div className="row">
          {stats.map((item) => (
            <div className="col-lg col-md-4 col-6" key={item.label}>
              <div className="star-stat">
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrainingSteps() {
  return (
    <section className="star-training pt---100 pb---100">
      <div className="container">
        <SectionTitle eyebrow="//How we Train//" title="How it helps your career succeed" />
        <div className="row">
          {trainingSteps.map((step) => (
            <div className="col-lg-3 col-md-6" key={step.number}>
              <div className="star-card star-step">
                <span>{step.number}</span>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="star-testimonials pt---100 pb---100">
      <div className="container">
        <SectionTitle title="Testimonials" text="What students say about Star Police Academy." />
        <div className="row">
          {testimonials.map((item) => (
            <div className="col-lg-6" key={item.name}>
              <blockquote className="star-card star-testimonial">
                <p>{item.text}</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQList({ limit }) {
  const visibleFaqs = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section className="star-faq pt---100 pb---100">
      <div className="container">
        <SectionTitle title="Frequently Asked Questions" />
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {visibleFaqs.map((item) => (
              <details className="star-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="star-cta">
      <div className="container">
        <div className="star-cta-inner">
          <h2>Ready to Serve and Protect? Join Our Star Police Academy Today!</h2>
          <div>
            <SiteLink href="/register" className="react-btn">
              Register
            </SiteLink>
            <a href={contact.whatsapp} className="react-btn-border" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpaMainHero() {
  return (
    <section
      className="hero3__area exact-spa-hero spa-main-hero p-relative"
      style={{ backgroundImage: `url(${academy.homeHeroBackground || academy.heroBackground})` }}
    >
      <div className="exact-spa-hero__overlay" />
      <div className="container p-relative">
        <div className="row g-4 spa-main-hero__row">
          <div className="col-lg-7 spa-main-hero__col">
            <div className="spa-main-hero__content">
            <span className="spa-main-hero__eyebrow">Best Police Coaching Centre in Tamil Nadu</span>
            <h1 className="spa-main-hero__title">
              Become a Tamil Nadu Police Officer with Expert TNUSRB Coaching
            </h1>
            <p className="spa-main-hero__text">
              Join Star Police Academy – Trusted by Thousands of Police Aspirants Since 2012.
              We provide complete classroom coaching, physical training, hostel facilities, study
              materials and mock tests to help you succeed in TNUSRB recruitment.
            </p>
            <ul className="spa-main-hero__highlights">
              {heroHighlights.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="spa-main-hero__actions">
              <SiteLink className="exact-spa-hero__register-btn" href="/contact-us">
                Contact Us <ArrowIcon />
              </SiteLink>
            </div>
            </div>
          </div>
          <div className="col-lg-5 spa-main-hero__col">
            <div className="spa-main-hero__card">
              <h3>{academy.tagline}</h3>
              <p>{academy.aboutIntro}</p>
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
  );
}

function SpaWhyChooseSection() {
  return (
    <section className="spa-hero-band spa-hero-band--why pt---100 pb---100">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5">
            <h2 className="spa-section-title">Why Choose Star Police Academy</h2>
            <p className="spa-section-text">
              Star Police Academy has been guiding police aspirants for over a decade with
              structured classroom coaching, expert trainers, and dedicated physical preparation.
              Our mission is to prepare every student for every stage of the Tamil Nadu Uniformed
              Services Recruitment Board (TNUSRB) selection process.
            </p>
            <SiteLink className="spa-section-link" href="/about">
              Learn More <ArrowIcon />
            </SiteLink>
          </div>
          <div className="col-lg-7">
            <div className="spa-feature-grid">
              {whyChooseFeatures.map((feature) => (
                <div className="spa-feature-grid__item" key={feature.label}>
                  <span aria-hidden="true" className="material-symbols-outlined">{feature.icon}</span>
                  <strong>{feature.label}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpaCoursesHeroSection() {
  return (
    <section
      className="spa-hero-band spa-hero-band--courses pt---100 pb---100"
      style={{ backgroundImage: "url(/assets/images/breadcrumbs/1.jpg)" }}
    >
      <div className="spa-hero-band__overlay" />
      <div className="container p-relative">
        <div className="spa-section-head text-center">
          <span className="spa-section-eyebrow spa-section-eyebrow--light">Star Police Academy</span>
          <h2 className="spa-section-title spa-section-title--light">Our Police Coaching Courses</h2>
          <p className="spa-section-text spa-section-text--light">
            Complete TNUSRB, SI, Police Constable, SSC - CRPF, CISF, BSF, SSB, ITBF, RPF, Defence, Navy, and Air Force coaching under one roof.
          </p>
        </div>
        <div className="row g-4 pt---30">
          {courses.map((course) => (
            <div className="col-lg-4 col-md-6" key={course.key}>
              <article className="spa-course-hero-card">
                <img src={course.image} alt={course.shortTitle} />
                <div className="spa-course-hero-card__body">
                  <h3>{course.shortTitle}</h3>
                  <p>{course.summary}</p>
                  <SiteLink className="spa-course-hero-card__btn" href={`/${course.key}`}>
                    Explore Course <ArrowIcon />
                  </SiteLink>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpaSelectionProcessSection() {
  return (
    <section className="spa-lizard-process pt---120 pb---120">
      <div className="container">
        <div className="spa-section-head text-center">
          <h2 className="spa-section-title">TNUSRB Selection Process</h2>
          <p className="spa-section-text">
            Understand every stage of the recruitment journey with our step-by-step guide.
          </p>
        </div>
        <div className="spa-lizard-process__track">
          {selectionProcessSteps.map((step, index) => (
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
  );
}

function SpaPhysicalGallerySection() {
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const previewItem = previewIndex !== null ? physicalTrainingItems[previewIndex] : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (previewIndex === null) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewIndex(null);
      }
      if (event.key === "ArrowLeft") {
        setPreviewIndex((current) => (current - 1 + physicalTrainingItems.length) % physicalTrainingItems.length);
      }
      if (event.key === "ArrowRight") {
        setPreviewIndex((current) => (current + 1) % physicalTrainingItems.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewIndex]);

  const showPrevious = () => {
    setPreviewIndex((current) => (current - 1 + physicalTrainingItems.length) % physicalTrainingItems.length);
  };

  const showNext = () => {
    setPreviewIndex((current) => (current + 1) % physicalTrainingItems.length);
  };

  const lightbox = previewItem && isMounted
    ? createPortal(
      <div
        className="spa-gallery-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`Gallery preview: ${previewItem.title}`}
        onClick={() => setPreviewIndex(null)}
      >
        <button
          type="button"
          className="spa-gallery-lightbox__nav spa-gallery-lightbox__nav--prev"
          aria-label="Previous image"
          onClick={(event) => {
            event.stopPropagation();
            showPrevious();
          }}
        >
          ‹
        </button>
        <div className="spa-gallery-lightbox__panel" onClick={(event) => event.stopPropagation()}>
          <button
            className="spa-gallery-lightbox__close"
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewIndex(null)}
          >
            ×
          </button>
          <div className="spa-gallery-lightbox__image-wrap">
            <img src={previewItem.image} alt={previewItem.title} />
          </div>
          <div className="spa-gallery-lightbox__caption">
            <span className="spa-gallery-lightbox__counter">
              {previewIndex + 1} / {physicalTrainingItems.length}
            </span>
            <h3>{previewItem.title}</h3>
            <p>{previewItem.description}</p>
          </div>
        </div>
        <button
          type="button"
          className="spa-gallery-lightbox__nav spa-gallery-lightbox__nav--next"
          aria-label="Next image"
          onClick={(event) => {
            event.stopPropagation();
            showNext();
          }}
        >
          ›
        </button>
      </div>,
      document.body,
    )
    : null;

  return (
    <section className="spa-physical-gallery pt---100 pb---100">
      <div className="container">
        <div className="spa-section-head text-center spa-physical-gallery__head">
          <h2 className="spa-section-title">Our gallery</h2>
          <p className="spa-physical-gallery__subtitle">Classroom Coaching &amp; Physical Training</p>
        </div>
        <div className="spa-physical-gallery__grid">
          {physicalTrainingItems.map((item, index) => (
            <button
              className="spa-physical-gallery__item"
              key={item.title}
              type="button"
              onClick={() => setPreviewIndex(index)}
            >
              <img src={item.image} alt={item.title} />
              <div className="spa-physical-gallery__overlay">
                <span aria-hidden="true" className="material-symbols-outlined">zoom_in</span>
                <strong>{item.title}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>
      {lightbox}
    </section>
  );
}

function SpaTestimonialsCardsSection() {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const { isPaused, pauseProps } = useAutoSliderPause();

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 991 ? 1 : 2);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % testimonials.length);
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const visibleItems = Array.from({ length: visibleCount }, (_, index) => {
    const item = testimonials[(startIndex + index) % testimonials.length];
    return item;
  });

  const showPrevious = () => {
    setStartIndex((current) => (current + testimonials.length - 1) % testimonials.length);
  };

  const showNext = () => {
    setStartIndex((current) => (current + 1) % testimonials.length);
  };

  return (
    <section className="spa-testimonials-cards pt---110 pb---120">
      <div className="container">
        <div className="react__title__section-all pb---30">
          <div className="row">
            <div className="col-md-12 text-center">
              <h2 className="react__tittle">Testimonials</h2>
            </div>
          </div>
        </div>
        <div className="spa-testimonials-cards__slider" {...pauseProps}>
          <button
            type="button"
            className="spa-testimonials-cards__arrow spa-testimonials-cards__arrow--prev"
            aria-label="Previous testimonial"
            onClick={showPrevious}
          >
            ‹
          </button>
          <div className="spa-testimonials-cards__track">
            {visibleItems.map((item, index) => (
              <article className="spa-testimonial-card" key={`${item.name}-${startIndex}-${index}`}>
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
                  <TestimonialAvatar name={item.name} size="sm" />
                  <div className="spa-testimonial-card__author-meta">
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="spa-testimonials-cards__arrow spa-testimonials-cards__arrow--next"
            aria-label="Next testimonial"
            onClick={showNext}
          >
            ›
          </button>
        </div>
        <div className="spa-testimonials-cards__dots" aria-label="Testimonial slides">
          {testimonials.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              className={index === startIndex ? "is-active" : ""}
              onClick={() => setStartIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpaFacilitiesSliderSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const transitionRef = useRef(null);
  const { isPaused, pauseProps } = useAutoSliderPause();

  const changeFacility = (nextIndex) => {
    if (nextIndex === activeIndexRef.current || isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    if (transitionRef.current) {
      window.clearTimeout(transitionRef.current);
    }

    transitionRef.current = window.setTimeout(() => {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      transitionRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }, 500);
    }, 450);
  };

  const showPreviousFacility = () => {
    changeFacility((activeIndexRef.current + facilitiesItems.length - 1) % facilitiesItems.length);
  };

  const showNextFacility = () => {
    changeFacility((activeIndexRef.current + 1) % facilitiesItems.length);
  };

  useAutoSliderInterval(showNextFacility, isPaused, [facilitiesItems.length]);

  useEffect(() => () => {
    if (transitionRef.current) {
      window.clearTimeout(transitionRef.current);
    }
  }, []);

  const activeFacility = facilitiesItems[activeIndex];

  return (
    <section className="spa-facilities-slider pt---100 pb---100">
      <div className="container">
        <div className="spa-section-head text-center">
          <h2 className="spa-section-title">Our Facilities</h2>
        </div>
        <div className="spa-facilities-slider__shell" {...pauseProps}>
          <button
            type="button"
            className="spa-facilities-slider__arrow spa-facilities-slider__arrow--prev"
            aria-label="Previous facility"
            onClick={showPreviousFacility}
          >
            ‹
          </button>
          <div className={`spa-facilities-slider__stage${isTransitioning ? " is-transitioning" : ""}`}>
            <div className="spa-facilities-slider__content" key={`content-${activeIndex}`}>
              <div className="spa-facilities-slider__meta">
                <span className="spa-facilities-slider__index">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(facilitiesItems.length).padStart(2, "0")}
                </span>
                <span className="spa-facilities-slider__icon" aria-hidden="true">
                  <span className="material-symbols-outlined">{activeFacility.icon}</span>
                </span>
              </div>
              <h3>{activeFacility.title}</h3>
              <p className="spa-facilities-slider__lead">{activeFacility.text}</p>
              <p className="spa-facilities-slider__details">{activeFacility.details}</p>
              <ul className="spa-facilities-slider__highlights">
                {activeFacility.highlights.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <SiteLink className="spa-facilities-slider__cta" href="/contact">
                Book a Campus Visit <ArrowIcon />
              </SiteLink>
            </div>
            <div className="spa-facilities-slider__visual" key={`visual-${activeIndex}`}>
              <img src={activeFacility.image} alt={activeFacility.title} loading="lazy" />
            </div>
          </div>
          <button
            type="button"
            className="spa-facilities-slider__arrow spa-facilities-slider__arrow--next"
            aria-label="Next facility"
            onClick={showNextFacility}
          >
            ›
          </button>
        </div>
        <div className="spa-facilities-slider__progress" aria-hidden="true">
          {facilitiesItems.map((item, index) => (
            <button
              key={`progress-${item.title}`}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-label={`Go to ${item.title}`}
              onClick={() => changeFacility(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpaRecruitmentBlogSection() {
  const cards = recruitmentUpdates.map((item, index) => ({
    ...item,
    author: academy.name,
    image: courses[index]?.image || item.image,
  }));

  return (
    <div className="react-blog__area blog__area spa-recruitment-blog pt---90 pb---120">
      <div className="container blog__width pb---120">
        <div className="react__title__section text-center">
          <h2 className="react__tittle">Latest TNUSRB Recruitment Updates</h2>
        </div>
        <div className="row">
          {cards.map((item) => (
            <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12" key={item.title}>
              <div className="blog__card mb-50">
                <div className="blog__thumb w-img p-relative">
                  <SiteLink className="blog__thumb--image" href={item.href}>
                    <img src={item.image} alt={item.title} />
                  </SiteLink>
                  <em className="b_date">{item.date}</em>
                </div>
                <div className="blog__card--content">
                  <div className="blog__card--content-area mb-25">
                    <span className="blog__card--date">{item.category}</span>
                    <h3 className="blog__card--title"><SiteLink href={item.href}>{item.title}</SiteLink></h3>
                  </div>
                  <div className="blog__card--icon d-flex align-items-center">
                    <div className="blog__card--icon-1">
                      <UserIcon />
                      <span>{item.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <SiteLink href="/notification" className="spa-section-link">
            View All Updates <ArrowIcon />
          </SiteLink>
        </div>
      </div>
    </div>
  );
}

function SpaStudentResultsSection() {
  return (
    <section className="spa-student-results pt---100 pb---100">
      <div className="container">
        <div className="spa-section-head text-center">
          <h2 className="spa-section-title">Student Results</h2>
          <p className="spa-section-text">Year-wise selection across police departments.</p>
        </div>
        <div className="spa-student-results__grid">
          {studentResults.map((result) => (
            <article className="spa-student-results__card" key={`${result.year}-${result.department}`}>
              <span className="spa-student-results__year">{result.year}</span>
              <strong className="spa-student-results__count">{result.count}</strong>
              <h3>{result.department}</h3>
              <span className="spa-student-results__badge">Selected</span>
            </article>
          ))}
        </div>
        <div className="spa-student-results__departments">
          {["Police Constable", "Sub Inspector", "Armed Reserve", "Jail Warder"].map((dept) => (
            <span key={dept}>{dept}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpaFaqExpandedSection() {
  return (
    <div className="accordion__area spa-faq-expanded p-relative pt---110 pb---100">
      <div className="accordion__shape">
        <img className="accordion__shape-1" src="/assets/images/acc.png" alt="shape" />
        <img className="accordion__shape-1a" src="/assets/images/banner2/shape_01.png" alt="shape" />
      </div>
      <div className="container">
        <div className="spa-faq-expanded__layout">
          <aside className="spa-faq-expanded__sidebar">
            <div className="accordion__wrapper-1">
              <h2>
                Frequently Asked <br />Questions
              </h2>
              <p>{academy.description}</p>
              <SiteLink href="/faq" className="border-btns">
                View FAQ Page <ArrowIcon />
              </SiteLink>
            </div>
          </aside>
          <div className="spa-faq-expanded__scroll" aria-label="FAQ answers">
            <div className="spa-faq-expanded__list">
              {faqs.map((item, index) => (
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
  );
}

function SpaLatestBlogSection() {
  const cards = latestBlogArticles.map((item, index) => ({
    ...item,
    author: academy.name,
    image: courses[index % courses.length]?.image || item.image,
  }));

  return (
    <div className="react-blog__area blog__area spa-latest-blog graybg-home pt---90 pb---120">
      <div className="container blog__width pb---120">
        <div className="react__title__section text-center">
          <h2 className="react__tittle">Latest Blog Articles</h2>
        </div>
        <div className="row">
          {cards.map((item) => (
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12" key={item.title}>
              <div className="blog__card mb-50">
                <div className="blog__thumb w-img p-relative">
                  <SiteLink className="blog__thumb--image" href={item.href}>
                    <img src={item.image} alt={item.title} />
                  </SiteLink>
                  <em className="b_date">{item.date}</em>
                </div>
                <div className="blog__card--content">
                  <div className="blog__card--content-area mb-25">
                    <span className="blog__card--date">{item.category}</span>
                    <h3 className="blog__card--title"><SiteLink href={item.href}>{item.title}</SiteLink></h3>
                  </div>
                  <div className="blog__card--icon d-flex align-items-center">
                    <div className="blog__card--icon-1">
                      <UserIcon />
                      <span>{item.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExactHomeHero() {
  return (
    <div
      className="hero3__area exact-spa-hero p-relative"
      style={{ backgroundImage: `url(${academy.heroBackground})` }}
    >
      <div className="exact-spa-hero__overlay" />
      <div className="container p-relative">
        <div className="hero3__content exact-spa-hero__content">
          <h1 className="hero3__title exact-spa-hero__title">{academy.heroTitle}</h1>
          <SiteLink className="exact-spa-hero__register-btn" href="/register">
            Register <ArrowIcon />
          </SiteLink>
        </div>
      </div>
    </div>
  );
}

function ExactHomeAboutSection() {
  return (
    <section className="spa-home-about pt---120 pb---120">
      <div className="container spa-home-about__container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <div className="spa-home-about__visual">
              <div className="spa-home-about__photo-wrap">
                <img
                  className="spa-home-about__photo"
                  src="/assets/images/about/home/classroom.jpg"
                  alt="Star Police Academy students in classroom"
                />
              </div>
              <div className="spa-home-about__badge">
                <strong className="spa-home-about__badge-title">STAR POLICE ACADEMY</strong>
                <span className="spa-home-about__badge-tagline">NO. 1 POLICE ACADEMY IN TAMIL NADU</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="spa-home-about__content">
              <h6 className="spa-home-about__eyebrow">ABOUT US</h6>
              <h2 className="spa-home-about__title">
                Tamil Nadu&apos;s Leading
                <br />
                <em>TNUSRB SI &amp; Police Coaching Centre</em>
              </h2>
              <p className="spa-home-about__text">{academy.aboutIntro}</p>
              <div className="spa-home-about__features">
                <div className="spa-home-about__feature">
                  <span aria-hidden="true" className="material-symbols-outlined spa-home-about__feature-icon">
                    emoji_events
                  </span>
                  <strong>Experts Around Tamilnadu</strong>
                </div>
                <div className="spa-home-about__feature">
                  <span aria-hidden="true" className="material-symbols-outlined spa-home-about__feature-icon">
                    schedule
                  </span>
                  <strong>Best Coaching Centres</strong>
                </div>
              </div>
              <div className="spa-home-about__footer">
                <SiteLink className="spa-home-about__location-btn" href="/contact">
                  → OUR LOCATION
                </SiteLink>
                <div className="spa-home-about__founder">
                  <img src="/assets/images/about/home/founder.jpg" alt={academy.founder} />
                  <div>
                    <strong>{academy.founder}</strong>
                    <span>{academy.founderRole}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExactPopularTopics() {
  return (
    <div className="react_populars_topics pt---120 pb---120">
      <div className="container">
        <div className="react__title__section react__title__section2">
          <div className="row align-v">
            <div className="col-md-8">
              <h2 className="react__tittle">
                Popular Topic, Which are Most <br /> Favourite To Students
              </h2>
            </div>
            <div className="col-md-4 text-right">
              <SiteLink href="/contact">Book a visit <ArrowIcon /></SiteLink>
            </div>
          </div>
        </div>
        <div className="row pt---30">
          {homeTopics.map((topic) => (
            <div className="col-md-3" key={topic.title}>
              <div className="item__inner">
                <div className="icon">
                  <img src={topic.icon} alt="Icon" />
                </div>
                <div className="react-content">
                  <h3 className="react-title"><SiteLink href="/courses">{topic.title}</SiteLink></h3>
                  <p>{topic.courses}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExactAboutSection() {
  return (
    <div className="about__area about2__area p-relative pb---120">
      <div className="container about__area-width">
        <div className="row">
          <div className="col-lg-6">
            <div className="about__image">
              <img className="react__shape__11" src="/assets/images/about/dot.png" alt="Shape" />
              <img className="react__shape__1" src="/assets/images/about/shape_02.png" alt="Shape" />
              <img src="/assets/images/about/about22.png" alt="About" />
              <img className="react__shape__2" src="/assets/images/about/shape_01.png" alt="Shape" />
              <img className="react__shape__33" src="/assets/images/about/shape_03.png" alt="Shape" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about__content">
              <h2 className="about__title">
                One of The Largest, <br /> <em>Most Online Course</em>
              </h2>
              <p className="about__paragraph">{academy.aboutIntro}</p>
              <ul>
                {trainingSteps.slice(0, 2).map((step) => (
                  <li key={step.number}><i className="icon_check" /> {step.title}</li>
                ))}
              </ul>
              <div className="about__btn">
                <SiteLink href="/about">Read More <ArrowIcon /></SiteLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExactCourseCard({ course, index }) {
  const smallImages = [1, 5, 2, 3, 4, 5];

  return (
    <div className={`single-studies col-lg-4 grid-item ${course.filters.join(" ")}`}>
      <div className="inner-course">
        <div className="case-img">
          <SiteLink href={`/${course.key}`} className="cate-w">{course.category}</SiteLink>
          <img src={course.image} alt={course.category} />
        </div>
        <div className="case-content">
          <ul className="meta-course">
            <li><StarIcon /> {course.review}</li>
            <li><UserIcon /> {course.students}</li>
          </ul>
          <h4 className="case-title">
            <SiteLink href={`/${course.key}`}>{course.title}</SiteLink>
          </h4>
          <div className="react__user">
            <img src={`/assets/images/course/small-image/${smallImages[index]}.png`} alt={course.author} /> {course.author}
          </div>
          <ul className="react-ratings">
            <li className="react-book"><FileTextIcon /> {course.lessons}</li>
            <li className="price">{course.price}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExactWinnerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const trackRef = useRef(null);
  const { isPaused, pauseProps } = useAutoSliderPause();

  const slideCount = winnerCarouselItems.length;
  const maxIndex = Math.max(0, slideCount - cardsPerView);

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setCardsPerView(1);
      } else if (width < 1200) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const card = track.children[activeIndex];
    if (card instanceof HTMLElement) {
      track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
  }, [activeIndex, cardsPerView]);

  const showPreviousWinner = () => {
    setActiveIndex((current) => (current <= 0 ? maxIndex : current - 1));
  };

  const showNextWinner = () => {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
  };

  useAutoSliderInterval(showNextWinner, isPaused, [maxIndex]);

  return (
    <section className="spa-winner-carousel pt---120 pb---100">
      <div className="container spa-winner-carousel__container">
        <h2 className="spa-winner-carousel__title">
          &ldquo;Being With A <span>WINNER</span>, Make You A <span>WINNER</span>.&rdquo;
        </h2>
      </div>
      <div className="spa-winner-carousel__stage" {...pauseProps}>
        <button
          type="button"
          className="spa-winner-carousel__arrow spa-winner-carousel__arrow--prev"
          aria-label="Previous winner slide"
          onClick={showPreviousWinner}
        >
          ‹
        </button>
        <div className="spa-winner-carousel__viewport" style={{ "--spa-cards-per-view": cardsPerView }}>
          <div className="spa-winner-carousel__track" ref={trackRef}>
            {winnerCarouselItems.map((item, index) => (
              <article
                className={`spa-winner-carousel__card${index === activeIndex ? " is-active" : ""}`}
                key={item.key}
              >
                <div className="spa-winner-carousel__poster">
                  <img src={item.poster} alt={item.title} />
                </div>
                <div className="spa-winner-carousel__info">
                  <h3 className="spa-winner-carousel__card-title">
                    <SiteLink href={item.href}>{item.title}</SiteLink>
                  </h3>
                  <p className="spa-winner-carousel__card-text">{item.description}</p>
                  <SiteLink className="spa-winner-carousel__read-more" href={item.href}>
                    Read More <ArrowIcon />
                  </SiteLink>
                </div>
              </article>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="spa-winner-carousel__arrow spa-winner-carousel__arrow--next"
          aria-label="Next winner slide"
          onClick={showNextWinner}
        >
          ›
        </button>
        <div className="spa-winner-carousel__dots" aria-label="Carousel pagination">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={activeIndex === index ? "is-active" : ""}
              key={`winner-dot-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExactAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const visibleFaqs = showAllFaqs ? faqs : faqs.slice(0, 4);

  const toggleFaq = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <div className="accordion__area p-relative pt---110">
      <div className="accordion__shape">
        <img className="accordion__shape-1" src="/assets/images/acc.png" alt="shape" />
        <img className="accordion__shape-1a" src="/assets/images/banner2/shape_01.png" alt="shape" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="accordion__wrapper">
              <div className="accordion__wrapper-1">
                <h6>Find Your Answers</h6>
                <h2>
                  Have any thought? <br />Look here.
                </h2>
                <p>{academy.description}</p>
                {showAllFaqs ? (
                  <SiteLink href="/faq" className="border-btns">
                    View All FAQs <ArrowIcon />
                  </SiteLink>
                ) : (
                  <button
                    type="button"
                    className="border-btns exact-read-more-btn"
                    onClick={() => {
                      setShowAllFaqs(true);
                      if (faqs.length > 4) {
                        setOpenIndex(4);
                      }
                    }}
                  >
                    Read More <ArrowIcon />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="accordion__wrapper1">
              <div className="accordion" id="accordionExample">
                {visibleFaqs.map((item, index) => (
                  <div className="accordion-item" key={`${item.question}-${index}`}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${openIndex === index ? "" : "collapsed"}`}
                        type="button"
                        aria-expanded={openIndex === index}
                        onClick={() => toggleFaq(index)}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openIndex === index ? "show" : ""}`}>
                      <div className="accordion-body">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExactInstructors() {
  return (
    <div className="instructor__area pt---115 pb---85 text-center">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-4 col-sm-6">
            <div className="instructor__content instructor__content-one">
              <div className="instructors_lefts">
                <h6>Course Instructors</h6>
                <h2>
                  Meet our <br /> Class Instructors
                </h2>
              </div>
            </div>
          </div>
          {homeInstructors.map((instructor) => (
            <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-4 col-sm-6" key={instructor.name}>
              <div className="instructor__content">
                <div className="instructor__content-1">
                  <InstructorPortrait instructor={instructor} />
                </div>
                <div className="instructor__content-2">
                  <h4><SiteLink href="/about">{instructor.name}</SiteLink></h4>
                  <p>{instructor.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExactClients() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { isPaused, pauseProps } = useAutoSliderPause();

  const showPrevious = () => {
    setActiveTestimonial((current) => (current + testimonials.length - 1) % testimonials.length);
  };

  const showNext = () => {
    setActiveTestimonial((current) => (current + 1) % testimonials.length);
  };

  useAutoSliderInterval(showNext, isPaused, [testimonials.length]);

  const activeItem = testimonials[activeTestimonial];

  return (
    <div className="react-clients react-clientso pt---120 pb---120">
      <div className="container">
        <div className="react__title__section text-center">
          <h6 className="react__subtitle">Student Community Feedback</h6>
          <h2 className="react__tittle">What our clients say about</h2>
        </div>
        <div className="exact-client-slider-wrap" {...pauseProps}>
          <div className="client-slider exact-client-slider">
            <button
              type="button"
              className="exact-client-arrow exact-client-prev"
              aria-label="Previous testimonial"
              onClick={showPrevious}
            >
              ‹
            </button>
            <div className="single-client" key={activeTestimonial}>
              <div className="client-bottom">
                <span className="client-author">
                  <TestimonialAvatar name={activeItem.name} size="lg" />
                </span>
              </div>
              <div className="client-content">
                <span className="client-title">{activeItem.name} <em> {activeItem.role}</em></span>
                <p>{activeItem.text}</p>
                <div className="testimonial__ratings">
                  <em className="icon_star" />
                  <em className="icon_star" />
                  <em className="icon_star" />
                  <em className="icon_star" />
                  <em className="icon_star_alt" />
                  <span><em>4.9</em> (14 Reviews)</span>
                </div>
                <img className="comma" src="/assets/images/testimonial/coma.png" alt="quote" />
              </div>
            </div>
            <button
              type="button"
              className="exact-client-arrow exact-client-next"
              aria-label="Next testimonial"
              onClick={showNext}
            >
              ›
            </button>
            <div className="exact-client-dots" aria-label="Testimonial slides">
              {testimonials.map((item, index) => (
                <button
                  type="button"
                  key={`${item.name}-${index}`}
                  aria-label={`Show testimonial ${index + 1}`}
                  className={index === activeTestimonial ? "is-active" : ""}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExactBlog() {
  return (
    <div className="react-blog__area blog__area pt---90 pb---120">
      <div className="container blog__width pb---120">
        <div className="react__title__section text-center">
          <h6 className="react__subtitle">Recent News.</h6>
          <h2 className="react__tittle">Star Police Academy News and Blogs</h2>
        </div>
        <div className="row">
          {homeBlogCards.map((item) => (
            <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12" key={item.title}>
              <div className="blog__card mb-50">
                <div className="blog__thumb w-img p-relative">
                  <SiteLink className="blog__thumb--image" href={item.href}>
                    <img src={item.image} alt={item.title} />
                  </SiteLink>
                  <em className="b_date">{item.date}</em>
                </div>
                <div className="blog__card--content">
                  <div className="blog__card--content-area mb-25">
                    <span className="blog__card--date">{item.category}</span>
                    <h3 className="blog__card--title"><SiteLink href={item.href}>{item.title}</SiteLink></h3>
                  </div>
                  <div className="blog__card--icon d-flex align-items-center">
                    <div className="blog__card--icon-1">
                      <UserIcon />
                      <span>{item.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExactHomePage() {
  return (
    <div className="react-wrapper-inner exact-home-page">
      <SpaMainHero />
      <SpaWhyChooseSection />
      <SpaCoursesHeroSection />
      <SpaSelectionProcessSection />
      <SpaPhysicalGallerySection />
      <SpaTestimonialsCardsSection />
      <SpaFacilitiesSliderSection />
      <SpaRecruitmentBlogSection />
      <SpaStudentResultsSection />
      <ExactHomeAboutSection />
      <SpaFaqExpandedSection />
    </div>
  );
}

function EchoolingHero() {
  return (
    <section className="echooling-hero">
      <div className="container">
        <div className="echooling-hero-stage">
          <img className="echooling-hero-shape echooling-hero-shape-one" src="/assets/images/hero/04.png" alt="" />
          <img className="echooling-hero-shape echooling-hero-shape-two" src="/assets/images/hero/shape_03.png" alt="" />
          <img className="echooling-hero-shape echooling-hero-shape-three" src="/assets/images/hero/shape_05.png" alt="" />
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="echooling-hero-copy">
                <h1>
                  Learn Course Online
                  <br />
                  <span>New Today</span>
                </h1>
                <img className="echooling-title-line" src="/assets/images/banner2/line_01.png" alt="" />
                <form
                  className="echooling-search"
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                >
                  <input type="search" placeholder="Search Course" aria-label="Search course" />
                  <button type="submit" aria-label="Search">
                    ⌕
                  </button>
                </form>
                <p className="echooling-hero-question">
                  Have questions? <SiteLink href="/contact">Get Free Sample →</SiteLink>
                </p>
                <div className="echooling-hero-stats-inline">
                  <div>
                    <strong>9.4k+</strong>
                    <span>Total active students taking gifted courses.</span>
                  </div>
                  <div>
                    <strong>70+</strong>
                    <span>Available field programs gifted courses.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="echooling-hero-visual">
                <div className="echooling-hero-circle" />
                <img className="echooling-hero-person" src="/assets/images/hero/02.png" alt="Student learning online" />
                <div className="echooling-floating-card echooling-floating-card-left">
                  <small>Online Courses</small>
                  <span>25K+</span>
                  <p>Largest collection in every course.</p>
                </div>
                <div className="echooling-floating-card echooling-floating-card-right">
                  <small>Congratulations</small>
                  <span>Admission Completed</span>
                  <p>Start learning today</p>
                </div>
                <div className="echooling-floating-card echooling-floating-card-bottom">
                  <small>Total Students</small>
                  <span>37K+</span>
                  <p>Experts Instructor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EchoolingSectionHeading({ eyebrow, title, action }) {
  return (
    <div className="echooling-section-heading">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
      {action ? (
        <SiteLink href={action.href} className="echooling-small-button">
          {action.label}
        </SiteLink>
      ) : null}
    </div>
  );
}

function EchoolingTopics() {
  return (
    <section className="echooling-topics">
      <div className="container">
        <EchoolingSectionHeading
          title="Popular Topic, Which are Most Favourite To Students"
          action={{ label: "Book a visit", href: "/contact" }}
        />
        <div className="row">
          {homeTopics.map((topic) => (
            <div className="col-lg-3 col-sm-6" key={topic.title}>
              <SiteLink href="/courses" className="echooling-topic-card">
                <img src={topic.icon} alt={topic.title} />
                <h3>{topic.title}</h3>
                <p>{topic.courses}</p>
              </SiteLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EchoolingVideoBlock() {
  return (
    <section className="echooling-video-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="echooling-video-card">
              <img src="/assets/images/course/1.png" alt="Online class preview" />
              <a className="echooling-play-button" href="/courses" aria-label="Play intro video">
                ▶
              </a>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="echooling-video-copy">
              <span>Start learning today</span>
              <h2>
                One of The Largest,
                <br />
                <strong>Most Online Course</strong>
              </h2>
              <p>
                Why I say old chap that is spiffing in my flat such a fibber mufty mush,
                porkies barney pukka only a quid a what a load of rubbish good time.
              </p>
              <ul>
                <li>Access more then 100K online courses</li>
                <li>Upskill your organization.</li>
              </ul>
              <SiteLink href="/courses" className="echooling-btn">
                Read More
              </SiteLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EchoolingCourseGrid() {
  return (
    <section className="echooling-course-section">
      <div className="container">
        <div className="echooling-course-top">
          <EchoolingSectionHeading title="Most Popular Courses" />
          <p className="echooling-course-subtitle">
            Why I say old chap that is spiffing in my flat such a fibber mufty.
          </p>
          <div className="echooling-course-tabs" aria-label="Course categories">
            {["See All", "Trending", "Featured", "Popularity", "Web Design"].map((item) => (
              <button type="button" key={item} className={item === "See All" ? "is-active" : ""}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          {homeCourses.map((course) => (
            <div className="col-lg-4 col-md-6" key={course.title}>
              <article className="echooling-course-card">
                <SiteLink href="/courses" className="echooling-course-image">
                  <img src={course.image} alt={course.title} />
                  <span>{course.category}</span>
                </SiteLink>
                <div className="echooling-course-body">
                  <div className="echooling-course-meta">
                    <span>★ {course.review}</span>
                    <span>{course.students}</span>
                  </div>
                  <h3>
                    <SiteLink href="/courses">{course.title}</SiteLink>
                  </h3>
                  <p className="echooling-course-author">{course.author}</p>
                  <div className="echooling-course-footer">
                    <span>{course.lessons}</span>
                    <strong>{course.price}</strong>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EchoolingQuestionSection() {
  return (
    <section className="echooling-questions">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5">
            <div className="echooling-question-copy">
              <span>Find Your Answers</span>
              <h2>
                Have any thought?
                <br />
                Look here.
              </h2>
              <p>
                Completely plagiarize fully researched collaboration and
                idea-sharing for covalent.
              </p>
              <SiteLink href="/faq" className="echooling-outline-btn">
                Read More →
              </SiteLink>
              <div className="echooling-question-decoration" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="echooling-accordion">
              {faqs.slice(0, 4).map((item, index) => (
                <details key={`${item.question}-${index}`} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EchoolingInstructors() {
  return (
    <section className="echooling-instructors">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4">
            <div className="echooling-instructors-title">
              <span>Course Instructors</span>
              <h2>Meet our Class Instructors</h2>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="echooling-instructor-orbit">
              {homeInstructors.map((instructor, index) => (
                <div className={`echooling-instructor-card echooling-instructor-${index + 1}`} key={instructor.name}>
                <InstructorPortrait instructor={instructor} />
                <h3>{instructor.name}</h3>
                <p>{instructor.role}</p>
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EchoolingTestimonials() {
  return (
    <section className="echooling-testimonials">
      <div className="container">
        <EchoolingSectionHeading eyebrow="Graat Words About Echooling." title="What our clients say about" />
        <div className="echooling-testimonial-wrap">
          <button type="button" className="echooling-slider-arrow echooling-slider-prev" aria-label="Previous testimonial">
            ‹
          </button>
          <div className="echooling-testimonial-card">
            <img src="/assets/images/testimonial/testimonial.png" alt="Student testimonial" />
            <div>
              <span className="echooling-quote-mark">"</span>
              <h3>Justin Case <em>Student</em></h3>
              <p>
                Nulla porttitor accumsan tincidunt. vamus magna justo, lacinia eget consectetur sed,
                convallis at tellus. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.
                Quisque velit nisi, pretium ut lacinia in.
              </p>
              <span className="echooling-rating">★★★★☆ <em>4.9</em> (14 Reviews)</span>
            </div>
          </div>
          <button type="button" className="echooling-slider-arrow echooling-slider-next" aria-label="Next testimonial">
            ›
          </button>
        </div>
        <div className="echooling-blog-strip">
          {homeBlogCards.map((item) => (
            <article key={item.title}>
              <img src={item.image} alt={item.title} />
              <div className="echooling-blog-date">{item.date}</div>
              <span>{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.author}</p>
              <SiteLink href="/blog">Read More</SiteLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EchoolingCta() {
  return (
    <section className="echooling-cta">
      <div className="container">
        <div className="echooling-cta-inner">
          <div>
            <span>Join our course today</span>
            <h2>Ready to dive in? Start your free Course today.</h2>
          </div>
          <SiteLink href="/register" className="echooling-white-button">
            Get Started
          </SiteLink>
        </div>
      </div>
    </section>
  );
}

function StatsFlipCard({ icon, value, suffix, label, detail }) {
  const [flipped, setFlipped] = useState(false);

  const toggleFlip = () => {
    setFlipped((current) => !current);
  };

  return (
    <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6">
      <button
        type="button"
        className={`spa-flip-card ${flipped ? "is-flipped" : ""}`}
        aria-pressed={flipped}
        aria-label={`${label}: ${value}${suffix}. Tap to flip for details.`}
        onClick={toggleFlip}
        onBlur={() => setFlipped(false)}
      >
        <div className="spa-flip-card__inner">
          <div className="spa-flip-card__face spa-flip-card__front">
            <img src={icon} alt={label} />
            <div className="spa-flip-card__value">
              <strong>{value}</strong>
              <em>{suffix}</em>
            </div>
            <span>{label}</span>
          </div>
          <div className="spa-flip-card__face spa-flip-card__back">
            <div className="spa-flip-card__value">
              <strong>{value}</strong>
              <em>{suffix}</em>
            </div>
            <span>{label}</span>
            <p>{detail}</p>
          </div>
        </div>
      </button>
    </div>
  );
}

function AboutStatsFlipSection() {
  return (
    <div className="spa-about-flip-stats">
      <div className="row g-4">
        {aboutCounterItems.map((item) => (
          <StatsFlipCard key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  return <ExactHomePage />;
}

function AboutIntroPageSection() {
  return (
    <section className="spa-about-intro pt---100 pb---120">
      <div className="container spa-about-intro__container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <div className="spa-about-intro__visual">
              <div className="spa-about-intro__main-photo">
                <img
                  src="/assets/images/about/home/classroom.jpg"
                  alt="Star Police Academy classroom coaching session"
                />
                <div className="spa-about-intro__experience">
                  <strong>{stats[0].value}</strong>
                  <span>{stats[0].label}</span>
                </div>
              </div>
              <div className="spa-about-intro__founder-card">
                <img src="/assets/images/about/home/founder.jpg" alt={academy.founder} />
                <div>
                  <strong>{academy.founder}</strong>
                  <span>{academy.founderRole}</span>
                </div>
              </div>
              <div className="spa-about-intro__badge">
                <div>
                  <strong>STAR POLICE ACADEMY</strong>
                  <span>NO. 1 IN TAMIL NADU</span>
                </div>
              </div>
              <div className="spa-about-intro__accent" aria-hidden="true" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="spa-about-intro__content">
              <h6 className="spa-about-intro__eyebrow">WELCOME</h6>
              <h2 className="spa-about-intro__title">
                Welcome to <br /> <em>Star Police Academy</em>
              </h2>
              <p className="spa-about-intro__lead">{academy.aboutIntro}</p>
              <p className="spa-about-intro__text">
                Star Police Academy is an organisation with state of the art competence to provide relevant and
                comprehensive training for Police Exams coaching in Vellore, dedicated for TNUSRB PC, Army, Navy,
                Air Force, SI and PC exams.
              </p>
              <div className="spa-about-intro__actions">
                <SiteLink href="/courses" className="spa-about-intro__btn">
                  Read More <ArrowIcon />
                </SiteLink>
                <div className="spa-about-intro__support">
                  <em>Get Support</em>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>
              <p className="spa-about-intro__guide">
                Have questions? <SiteLink href="/contact">Get Free Guide</SiteLink>
              </p>
            </div>
          </div>
        </div>
        <AboutStatsFlipSection />
      </div>
    </section>
  );
}

function AboutLearningSection() {
  return (
    <div className="react_populars_topics react_populars_topics2 react_populars_topics_about pb---80">
      <div className="react__title__section react__title__section-all exact-coaching-headband">
        <div className="container exact-coaching-title-wrap">
          <div className="row">
            <div className="col-md-12 exact-coaching-headings">
              <h6 className="exact-coaching-eyebrow">Police Exam Coaching Programs</h6>
              <h2 className="react__tittle">
                Star Police Academy Coaching For <br /> TNUSRB, SI &amp; Defence Exams
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row pt---30">
          {aboutLearningCards.map((card, index) => (
            <div className="col-md-4" key={card.title}>
              <div className="item__inner">
                <div className="icon">
                  <img src={aboutLearningIcons[index]} alt={card.title} />
                </div>
                <div className="react-content">
                  <h3 className="react-title">
                    <SiteLink href="/courses">{card.title}</SiteLink>
                  </h3>
                  <p>{card.text}</p>
                  <SiteLink href="/courses">
                    Learn More <ArrowIcon />
                  </SiteLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutInstructorsSection() {
  return (
    <div className="instructor__area pt---0 pb---110 text-center">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-4 col-sm-6">
            <div className="instructor__content instructor__content-one">
              <div className="instructors_lefts">
                <h6>Course Instructors</h6>
                <h2>
                  Meet our <br /> Class Instructors
                </h2>
              </div>
            </div>
          </div>
          {homeInstructors.map((instructor) => (
            <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-4 col-sm-6" key={instructor.name}>
              <div className="instructor__content">
                <div className="instructor__content-1">
                  <InstructorPortrait instructor={instructor} />
                </div>
                <div className="instructor__content-2">
                  <h4>
                    <SiteLink href="/about">{instructor.name}</SiteLink>
                  </h4>
                  <p>{instructor.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutFacultySection() {
  return (
    <section className="spa-about-faculty pt---110 pb---80">
      <div className="container">
        <div className="spa-about-faculty__header text-center">
          <span className="spa-about-faculty__eyebrow">Expert Faculty</span>
          <h2 className="spa-about-faculty__title">
            Meet Our <br />Faculty Team
          </h2>
          <p className="spa-about-faculty__subtitle">
            Experienced teachers guiding TNUSRB, SI and police aspirants with subject expertise and exam-focused coaching.
          </p>
        </div>

        <div className="spa-about-faculty__grid">
          {facultyMembers.map((member) => (
            <article className="spa-about-faculty__card" key={member.name}>
              <div className="spa-about-faculty__photo">
                <img src={encodeAssetPath(member.image)} alt={member.name} loading="lazy" />
              </div>
              <div className="spa-about-faculty__content">
                <h3>{member.name}</h3>
                <p className="spa-about-faculty__detail">
                  <strong className="spa-about-faculty__detail-label">Qualification</strong>
                  <span className="spa-about-faculty__detail-value">{member.qualification}</span>
                </p>
                <p className="spa-about-faculty__detail">
                  <strong className="spa-about-faculty__detail-label">Designation</strong>
                  <span className="spa-about-faculty__detail-value">{member.designation}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutFeedbackSection() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const { isPaused, pauseProps } = useAutoSliderPause();

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 767 ? 1 : 2);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    setSlideIndex(0);
  }, [visibleCount]);

  const totalSlides = Math.ceil(testimonials.length / visibleCount);
  const visibleItems = testimonials.slice(
    slideIndex * visibleCount,
    slideIndex * visibleCount + visibleCount
  );

  const showPrevious = () => {
    setSlideIndex((current) => (current - 1 + totalSlides) % totalSlides);
  };

  const showNext = () => {
    setSlideIndex((current) => (current + 1) % totalSlides);
  };

  useAutoSliderInterval(showNext, isPaused, [totalSlides]);

  return (
    <section className="spa-about-feedback pt---110 pb---120">
      <div className="spa-about-feedback__glow" aria-hidden="true" />
      <div className="container">
        <div className="spa-about-feedback__header text-center">
          <span className="spa-about-feedback__eyebrow">Student Satisfaction</span>
          <h2 className="spa-about-feedback__title">
            Student Community <br />Feedback
          </h2>
          <p className="spa-about-feedback__subtitle">
            Real stories from aspirants who trained with Star Police Academy.
          </p>
        </div>

        <div className="spa-about-feedback__slider" {...pauseProps}>
          <button
            type="button"
            className="spa-about-feedback__arrow spa-about-feedback__arrow--prev"
            aria-label="Previous testimonials"
            onClick={showPrevious}
          >
            ‹
          </button>

          <div className="spa-about-feedback__track">
            {visibleItems.map((item) => (
              <article className="spa-about-feedback__card" key={item.name}>
                <div className="spa-about-feedback__quote" aria-hidden="true">“</div>
                <div className="spa-about-feedback__rating">
                  <span className="spa-about-feedback__stars" aria-hidden="true">
                    <em className="icon_star" />
                    <em className="icon_star" />
                    <em className="icon_star" />
                    <em className="icon_star" />
                    <em className="icon_star_alt" />
                  </span>
                  <span className="spa-about-feedback__reviews">14 Reviews</span>
                </div>
                <p className="spa-about-feedback__text">{item.text}</p>
                <div className="spa-about-feedback__author">
                  <TestimonialAvatar name={item.name} size="sm" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="spa-about-feedback__arrow spa-about-feedback__arrow--next"
            aria-label="Next testimonials"
            onClick={showNext}
          >
            ›
          </button>
        </div>

        <div className="spa-about-feedback__dots" role="tablist" aria-label="Testimonial slides">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={`feedback-slide-${index}`}
              type="button"
              className={`spa-about-feedback__dot ${slideIndex === index ? "is-active" : ""}`}
              aria-label={`Go to testimonial slide ${index + 1}`}
              aria-selected={slideIndex === index}
              onClick={() => setSlideIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="react-wrapper-inner exact-about-page">
      <ExactBreadcrumb title="About Star Police Academy" />
      <AboutIntroPageSection />
      <AboutLearningSection />
      <AboutFacultySection />
      <AboutFeedbackSection />
    </div>
  );
}

function CoursesPage() {
  return (
    <>
      <Breadcrumb title="Courses" />
      <CourseGrid />
      <TrainingSteps />
      <CTA />
    </>
  );
}

function CourseDetailPage({ courseKey }) {
  const course = courses.find((item) => item.key === courseKey) || courses[0];

  return (
    <>
      <Breadcrumb title={course.shortTitle} />
      <section className="star-course-detail pt---100 pb---100">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <article className="star-card star-detail-card">
                <img src={course.image} alt={course.shortTitle} />
                <span>Star Police Academy</span>
                <h2>Explore our {course.shortTitle} Course</h2>
                <p>{course.summary}</p>
                {course.sections.map((section) => (
                  <div className="star-detail-section" key={section.title}>
                    <h3>{section.title}</h3>
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </article>
            </div>
            <div className="col-lg-4">
              <aside className="star-card star-sidebar">
                <h3>Courses</h3>
                <ul>
                  {courses.map((item) => (
                    <li key={item.key}>
                      <SiteLink href={`/${item.key}`}>{item.shortTitle}</SiteLink>
                    </li>
                  ))}
                </ul>
                <SiteLink href="/register" className="react-btn">
                  Register
                </SiteLink>
              </aside>
            </div>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}

function getAchieverInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.replace(/\./g, "").charAt(0))
    .join("")
    .toUpperCase();
}

function AchieverImage({ achiever, className = "" }) {
  const extensions = ["jpg", "jpeg", "png", "webp"];
  const candidates = useMemo(() => {
    const values = [];

    if (achiever.image) {
      values.push(achiever.image);
    }

    extensions.forEach((extension) => {
      values.push(`${achiever.imageBase}.${extension}`);
    });

    return [...new Set(values)];
  }, [achiever]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const hasImage = candidateIndex < candidates.length;
  const src = hasImage ? encodeAssetPath(candidates[candidateIndex]) : "";

  if (!hasImage) {
    return (
      <div className={`star-toppers-showcase__placeholder ${className}`.trim()} aria-hidden="true">
        <span>{getAchieverInitials(achiever.name)}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={`${achiever.name} - ${achiever.post}`}
      loading="lazy"
      onError={() => setCandidateIndex((current) => current + 1)}
    />
  );
}

function ToppersPage() {
  return (
    <>
      <ExactBreadcrumb title="Toppers and Achievers" />
      <section className="star-toppers-page pt---100 pb---100">
        <div className="container">
          <div className="star-toppers-page__head text-center mb---50">
            <p className="star-toppers-page__eyebrow">//Our Toppers and Achievers//</p>
            <h1 className="star-toppers-page__title">TNUSRB – SUB INSPECTOR –2026</h1>
            <h2 className="star-toppers-page__subtitle">STATE 1ST RANK – SUB-INSPECTOR</h2>
          </div>

          <div className="star-toppers-showcase">
            <div className="star-toppers-showcase__header">
              <span className="star-toppers-showcase__badge">STATE 1ST RANK</span>
              <span className="star-toppers-showcase__role">SUB-INSPECTOR</span>
            </div>
            <div className="star-toppers-showcase__grid">
              {toppersAchievers2026.map((achiever) => (
                <article className="star-toppers-showcase__card" key={achiever.registerNo}>
                  <div className="star-toppers-showcase__photo">
                    <AchieverImage achiever={achiever} />
                  </div>
                  <div className="star-toppers-showcase__label">
                    <strong>{achiever.name}</strong>
                    <span>{achiever.post}</span>
                  </div>
                  <p className="star-toppers-showcase__register">{achiever.registerNo}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="text-center mt---50">
            <SiteLink href="/contact" className="react-btn">
              Contact Us
            </SiteLink>
          </div>
        </div>
      </section>
    </>
  );
}

function FormMessage({ message }) {
  return message ? <p className="star-form-message">{message}</p> : null;
}

async function submitContactViaFormSubmit(formData) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(contact.formEmail)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      phone: formData.phone,
      message: formData.message,
      _subject: `[Contact Form] ${formData.subject}`,
      _replyto: formData.email,
      _template: "table",
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Unable to send your message right now. Please try again or contact the academy directly.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to send your message right now.");
  }

  return { success: true, message: "Your message has been sent successfully." };
}

async function submitContactForm(formData) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    return submitContactViaFormSubmit(formData);
  }

  if (response.ok && result.success) {
    return result;
  }

  if (response.status === 400) {
    throw new Error(result.message || "Please fill in the required fields.");
  }

  try {
    return await submitContactViaFormSubmit(formData);
  } catch (fallbackError) {
    throw new Error(result.message || fallbackError.message || "Unable to send your message right now.");
  }
}

function ContactForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await submitContactForm(formData);
      setMessage(result.message || "Your message has been sent successfully.");
      setFormData({ name: "", email: "", subject: "", phone: "", message: "" });
    } catch (error) {
      setMessage(error.message || "Unable to send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="star-form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
        </div>
        <div className="col-md-6">
          <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
        </div>
        <div className="col-md-6">
          <input required type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" />
        </div>
        <div className="col-md-6">
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
        </div>
        <div className="col-12">
          <textarea required name="message" value={formData.message} onChange={handleChange} placeholder="Message *" rows={6} />
        </div>
        <div className="col-12">
          <button type="submit" className="react-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message →"}
          </button>
          <FormMessage message={message} />
        </div>
      </div>
    </form>
  );
}

function ContactPage() {
  return (
    <>
      <ExactBreadcrumb title="Contact Us" />
      <section className="star-contact star-contact-screen pt---100 pb---100">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-lg-4">
              <div className="star-contact-info-panel">
                <div className="star-contact-info-item">
                  <span>⌂</span>
                  <div>
                    <h3>Address</h3>
                    <p>{contact.address}</p>
                  </div>
                </div>
                <div className="star-contact-info-item">
                  <span>☎</span>
                  <div>
                    <h3>Contact</h3>
                    <p>
                      <span className="star-contact-detail-line">Mobile1: {contact.phonePrimary}</span>
                      <br />
                      <span className="star-contact-detail-line">Mobile2: {contact.phoneSecondary}</span>
                      <br />
                      <span className="star-contact-detail-line">Email: {contact.email}</span>
                    </p>
                  </div>
                </div>
                <div className="star-contact-info-item">
                  <span>◷</span>
                  <div>
                    <h3>Hour of operation</h3>
                    <p>
                      Monday - Saturday: 09:00 - 20:00
                      <br />
                      Sunday: Contact office for batch timings
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="star-contact-form-panel">
                <h2>
                  Questions?
                  <br />
                  Feel free to contact us.
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
          <div className="star-contact-map">
            <iframe
              title="Star Police Academy location map"
              src={contact.mapEmbedUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="star-contact-map__open"
              href={contact.mapShareUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Star Police Academy location in Google Maps"
            />
            <a
              className="star-contact-map__location-card"
              href={contact.mapShareUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="star-contact-map__location-label">{contact.mapCoordinates.label}</span>
              <p>
                {contact.addressLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </a>
            <div className="star-contact-map__pin" aria-hidden="true">
              <div className="star-contact-map__pin-label">{academy.name}</div>
              <svg viewBox="0 0 36 48" role="img" aria-label="Star Police Academy location pin">
                <path
                  d="M18 0C8.06 0 0 8.06 0 18c0 12.15 18 30 18 30s18-17.85 18-30C36 8.06 27.94 0 18 0z"
                  fill="#ea4335"
                />
                <circle cx="18" cy="18" r="7.5" fill="#ffffff" />
              </svg>
            </div>
            <a
              className="star-contact-map__cta"
              href={contact.mapShareUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function RegistrationForm() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="star-form"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("Application captured. Please contact the office to complete admission.");
      }}
    >
      <select required defaultValue="">
        <option value="" disabled>
          Courses Willing to Join *
        </option>
        {registrationCourses.map((course) => (
          <option key={course}>{course}</option>
        ))}
      </select>
      <div className="row">
        {[
          "Name*",
          "Father Name*",
          "Mother Name*",
          "Husband/Spouse Name*",
          "Date of Birth*",
          "Nationality*",
          "Religion*",
          "Community*",
          "Educational Qualification*",
          "Medium of Instruction*",
          "Height*",
          "Covid vaccination Particulars*",
          "Mobile Number*",
          "Parents/Spouse Mobile No*",
        ].map((placeholder) => (
          <div className="col-md-6" key={placeholder}>
            <input required={placeholder.endsWith("*")} type="text" placeholder={placeholder} />
          </div>
        ))}
      </div>
      <div className="star-radio-group">
        <span>Gender *</span>
        <label>
          <input required type="radio" name="gender" /> Male
        </label>
        <label>
          <input required type="radio" name="gender" /> Female
        </label>
      </div>
      <textarea placeholder="Full Address" rows={5} />
      <input required type="text" placeholder="Type the word *" />
      <button type="submit" className="react-btn">
        Submit Application
      </button>
      <FormMessage message={message} />
    </form>
  );
}

function RegisterPage() {
  return (
    <>
      <Breadcrumb title="Students Application" />
      <section className="star-register pt---100 pb---100">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <SectionTitle
                eyebrow="Star Police Academy Registration"
                title="Students Application"
                text="Star Police Academy - Students Registration Application."
                center={false}
              />
              <RegistrationForm />
            </div>
            <div className="col-lg-5">
              <div className="star-card star-terms">
                <h3>Terms & Conditions:</h3>
                <ul>
                  {terms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const materialsItems = [
  {
    title: "TARGET காக்கிசட்டை 2026",
    description: "Our Dedicated intensive Programme for, TNUSRB Sub Inspector (Taluk, AR, TSP)",
    image: "/assets/images/books/a1.jpg",
    href: schedulePdfUrl,
  },
  {
    title: "Tamil Book TNUSRB SUB INSPECTOR & POLICE",
    description: "BIOLOGY Book Back Questions book by star police academy",
    image: "/assets/images/books/t1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "BIOLOGY Book TNUSRB SUB INSPECTOR & POLICE",
    description: "BIOLOGY Book Back Questions book by star police academy",
    image: "/assets/images/books/b1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "CHEMISTRY Book TNUSRB SUB INSPECTOR & POLICE",
    description: "CHEMISTRY Book Back Questions book by star police academy",
    image: "/assets/images/books/c1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "ECONOMICS Book TNUSRB SUB INSPECTOR & POLICE",
    description: "ECONOMICS Book Back Questions book by star police academy",
    image: "/assets/images/books/e1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "GEOGRAPHY Book TNUSRB SUB INSPECTOR & POLICE",
    description: "GEOGRAPHY Book Back Questions book by star police academy",
    image: "/assets/images/books/g1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "HISTORY Book TNUSRB SUB INSPECTOR & POLICE",
    description: "HISTORY Book Back Questions book by star police academy",
    image: "/assets/images/books/h1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "HISTORY Book TNUSRB SUB INSPECTOR & POLICE II",
    description: "HISTORY Book Back Questions book by star police academy",
    image: "/assets/images/books/h2.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "INDIAN POLITY Book TNUSRB SUB INSPECTOR & POLICE",
    description: "INDIAN POLITY Book Back Questions book by star police academy",
    image: "/assets/images/books/i1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "PHYSICS Book TNUSRB SUB INSPECTOR & POLICE",
    description: "PHYSICS Book Back Questions book by star police academy",
    image: "/assets/images/books/p1.jpg",
    href: "tel:+919363459430",
  },
  {
    title: "PHYCHOLOGY Book TNUSRB SUB INSPECTOR & POLICE",
    description: "PHYCHOLOGY Book Back Questions book by star police academy",
    image: "/assets/images/books/py1.jpg",
    href: "tel:+919363459430",
  },
];

function MaterialsPage() {
  return (
    <>
      <ExactBreadcrumb title="Training Materials" />
      <section className="star-section star-materials-page pt---100 pb---100">
        <div className="container">
          <div className="text-center mb---40">
            <p className="mb---10" style={{ color: "#a66b2d", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              TRAINING MATERIALS
            </p>
            <h1 className="mb---15" style={{ fontSize: "2.4rem", lineHeight: 1.2 }}>
              Training Materials
            </h1>
            <p className="mb---0" style={{ color: "#5b6472", maxWidth: "720px", margin: "0 auto" }}>
              By Star Police Academy
            </p>
          </div>

          <div className="row g-4">
            {materialsItems.map((item) => (
              <div className="col-lg-6" key={item.title}>
                <article className="star-card" style={{ overflow: "hidden", height: "100%" }}>
                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "260px", objectFit: "cover" }} />
                  <div style={{ padding: "24px" }}>
                    <h3 className="mb---10">{item.title}</h3>
                    <p style={{ color: "#5b6472", marginBottom: "16px" }}>{item.description}</p>
                    <a href={item.href} target="_blank" rel="noreferrer" className="react-btn">
                      Get It Now
                    </a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FAQPage() {
  return (
    <>
      <Breadcrumb title="Frequently Asked Questions" />
      <FAQList />
    </>
  );
}

function AnswerKeysPage() {
  return (
    <>
      <ExactBreadcrumb title="Answer Keys" />
      <section className="star-question-papers pt---70 pb---100">
        <div className="container">
          <SectionTitle eyebrow="Answer Keys" title="Solved Answer Keys" />
          <div className="text-center mb---40" style={{ maxWidth: "720px", margin: "0 auto 32px" }}>
            <p style={{ color: "#5b6472", marginBottom: 0 }}>
              Download the latest solved answer keys for SI & Police exam practice and revision.
            </p>
          </div>
          <div className="star-question-list">
            {questionPapers.map((paper) => (
              <article className="star-question-card" key={`answer-key-${paper.title}-${paper.testNo}-${paper.date}`}>
                <div className="star-question-main">
                  <span className="star-question-category">{paper.category}</span>
                  <h3>{paper.title}</h3>
                  <strong>{paper.testNo}</strong>
                  <p>{paper.description}</p>
                </div>
                <div className="star-question-action">
                  <span>
                    Date : <strong>{paper.date}</strong>
                  </span>
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#c62828",
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      display: "inline-block",
                      fontWeight: 600,
                    }}
                  >
                    Download Now
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function QuestionPapersPage() {
  return (
    <>
      <ExactBreadcrumb title="Questions Paper" />
      <section className="star-question-papers pt---70 pb---100">
        <div className="container">
          <SectionTitle eyebrow="Question papers" title="Police Training Question papers" />
          <div className="star-question-list">
            {questionPapers.map((paper) => (
              <article className="star-question-card" key={`${paper.title}-${paper.testNo}-${paper.date}`}>
                <div className="star-question-main">
                  <span className="star-question-category">{paper.category}</span>
                  <h3>{paper.title}</h3>
                  <strong>{paper.testNo}</strong>
                  <p>{paper.description}</p>
                </div>
                <div className="star-question-action">
                  <span>
                    Date : <strong>{paper.date}</strong>
                  </span>
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#c62828",
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      display: "inline-block",
                      fontWeight: 600,
                    }}
                  >
                    Download Now
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const testBatchPaths = new Set([
  "/test-batch",
  "/test-batch.php",
  "/test-batches",
  "/star-police-academy-test-batches",
]);

function resolveNotificationBannerTitle(path = "/", page) {
  if (page?.bannerTitle) {
    return page.bannerTitle;
  }

  const cleanPath = path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  if (testBatchPaths.has(cleanPath)) {
    return "Test Batches";
  }

  return "Recruitment Notification";
}

function NotificationPage({ bannerTitle = "Recruitment Notification" }) {
  const isTestBatches = bannerTitle === "Test Batches";

  return (
    <>
      <ExactBreadcrumb
        title={bannerTitle}
        className={isTestBatches ? "exact-test-batches-breadcrumb" : ""}
      />
      <section className="star-notification pt---80 pb---100">
        <div className="container">
          <div className="row">
            <div className="col-lg-9 mb-4 mb-lg-0">
              <div className="star-notification-intro">
                <div className="star-notification-video">
                  <a
                    aria-label="Watch Star Police Academy intro video"
                    href="https://www.youtube.com/watch?v=1ppfH0p_UYM"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ▶
                  </a>
                </div>
                <div className="star-notification-copy">
                  <p>
                    Direct Recruitment of Sub-Inspectors of Police (Taluk, AR & TSP) - 2023.
                    <br />
                    <br />
                    The TNUSRB SI notification 2023 Notification will be issued soon at the
                    official website tnusrb.tn.gov.in.
                    <br />
                    <br />
                    The online application process will be conducted from ? at the official
                    website.
                  </p>
                  <div className="star-notification-support">
                    <span>☏</span>
                    <div>
                      <h3>“Being With A WINNER", Make You A WINNER”.</h3>
                      <strong>{contact.phonePrimary}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="star-notification-counter">
                <h2>14+</h2>
                <h5>Years Of Experience</h5>
                <p>
                  1000+ Job Placement
                  <br />
                  Join US
                </p>
              </div>
            </div>
          </div>

          <div className="star-schedule-frame">
            <iframe
              title="SPA Test Schedule"
              src={`${schedulePdfUrl}#toolbar=0`}
            />
          </div>

          <div className="star-notification-list">
            {notificationItems.map((item) => (
              <article className="star-notification-card" key={`${item.title}-${item.date}`}>
                <div className="star-notification-main">
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                  <p className="star-notification-subtitle">{item.subtitle}</p>
                  <p>{item.description}</p>
                </div>
                <div className="star-notification-download">
                  <p>
                    <strong>Date:</strong> {item.date}
                  </p>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Download Now
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function YoutubePage() {
  return (
    <>
      <ExactBreadcrumb title="Our Recent Videos" />
      <section className="star-youtube-page pt---100 pb---100">
        <div className="container">
          <div className="row">
            {youtubeVideos.map((videoId) => (
              <div className="col-md-6 col-xl-4" key={videoId}>
                <div className="star-video-card">
                  <iframe
                    title={`Star Police Academy video ${videoId}`}
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PageContent({ page, path = "/" }) {
  switch (page.type) {
    case "about":
      return <AboutPage />;
    case "courses":
      return <CoursesPage />;
    case "course":
      return <CourseDetailPage courseKey={page.courseKey} />;
    case "register":
      return <RegisterPage />;
    case "contact":
      return <ContactPage />;
    case "materials":
      return <MaterialsPage />;
    case "answer-keys":
      return <AnswerKeysPage />;
    case "faq":
      return <FAQPage />;
    case "questions":
      return <QuestionPapersPage />;
    case "notification":
      return (
        <NotificationPage bannerTitle={resolveNotificationBannerTitle(path, page)} />
      );
    case "youtube":
      return <YoutubePage />;
    case "toppers":
      return <ToppersPage />;
    case "si-landing":
      return <SiLandingPage />;
    case "tnusrb-landing":
      return <TnusrbLandingPage />;
    case "army-landing":
      return <ArmyLandingPage />;
    case "navy-landing":
      return <NavyLandingPage />;
    case "air-force-landing":
      return <AirForceLandingPage />;
    case "rpf-landing":
      return <RpfLandingPage />;
    case "capf-landing":
      return <CapfLandingPage />;
    case "home":
    default:
      return <HomePage />;
  }
}

export default function StarSite({ page, path = "/" }) {
  const seo = useMemo(() => buildPageSeo(page, path), [page, path]);

  useEffect(() => {
    document.body.className = "star-site";
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  return (
    <>
      <SiteHead seo={seo} />
      <Header />
      <main className="react-wrapper star-main">
        <PageContent page={page} path={path} />
      </main>
      <Footer />
      <div id="backscrollUp" className="home">
        <span aria-hidden="true" className="arrow_carrot-up" />
      </div>
    </>
  );
}
