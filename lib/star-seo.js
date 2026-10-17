const { academy, contact, courses, faqs, socialLinks } = require("./star-content");

const SITE_URL = "https://www.starpoliceacademy.in";
const BRAND_NAME = "Star Police Academy";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const DEFAULT_OG_IMAGE = "/assets/images/hero/star-police-academy-campus-hero.jpg";
const FAVICON = "/assets/images/logos/favicon.png";

const canonicalByType = {
  home: "/",
  about: "/about",
  courses: "/courses",
  register: "/register",
  contact: "/contact-us",
  faq: "/faq",
  materials: "/star-police-academy-training-materials",
  questions: "/star-police-academy-question-papers",
  "answer-keys": "/star-police-academy-answer-keys",
  notification: "/star-police-academy-current-affairs",
  youtube: "/star-police-academy-youtube",
  toppers: "/star-police-academy-toppers-and-achievers",
  "si-landing": "/tnusrb-police-sub-inspector-coaching",
  "tnusrb-landing": "/tnusrb-police-constable-coaching",
  "army-landing": "/agnipath-indian-army-coaching",
  "navy-landing": "/agnipath-indian-navy-coaching",
  "air-force-landing": "/indian-air-force-coaching",
  "rpf-landing": "/railway-protection-force-coaching",
  "capf-landing": "/capf",
};

const courseCanonicalByKey = {
  tnusrb: "/tnusrb",
  "sub-inspector": "/police-sub-inspector-coaching",
  "indian-army": "/agnipath-indian-army-coaching",
  "indian-navy": "/agnipath-indian-navy-coaching",
  "indian-air-force": "/indian-air-force-coaching",
  rpf: "/railway-protection-force-coaching",
  capf: "/capf",
};

const typeSeoDefaults = {
  home: {
    title: academy.title,
    useBrandSuffix: false,
    description:
      "Star Police Academy in Vellore, Tamil Nadu offers TNUSRB SI and Police Constable coaching with expert faculty, physical training, mock tests, hostel facility and proven results since 2012.",
    keywords:
      "TNUSRB coaching, police coaching centre Tamil Nadu, SI coaching Vellore, police constable coaching, Star Police Academy, TNUSRB SI coaching, police exam coaching",
    ogImage: DEFAULT_OG_IMAGE,
  },
  about: {
    title: "About Star Police Academy | TNUSRB Coaching in Vellore",
    useBrandSuffix: false,
    description:
      "Learn about Star Police Academy, Vellore's trusted TNUSRB SI and Police Constable coaching institute with 14+ years of experience, expert faculty and complete exam preparation.",
    keywords:
      "About Star Police Academy, TNUSRB coaching Vellore, police academy Tamil Nadu, SI coaching centre, police training institute",
    ogImage: "/assets/images/about/home/classroom.jpg",
  },
  courses: {
    title: "Police Exam Coaching Courses | TNUSRB SI & Constable",
    useBrandSuffix: false,
    description:
      "Explore TNUSRB SI, Police Constable, Indian Army, Navy, Air Force, RPF and CAPF coaching programmes at Star Police Academy with syllabus coverage, tests and physical training.",
    keywords:
      "police coaching courses, TNUSRB courses, SI coaching, constable coaching, defence exam coaching Tamil Nadu",
    ogImage: DEFAULT_OG_IMAGE,
  },
  course: {
    useBrandSuffix: false,
  },
  "si-landing": {
    title: "Police SI Coaching in Tamil Nadu | TNUSRB Sub Inspector Coaching",
    useBrandSuffix: false,
    description:
      "Join the best Police Sub Inspector coaching in Tamil Nadu. Expert faculty, TNUSRB syllabus, mock tests, physical training, interview guidance and high success rate at Star Police Academy.",
    keywords:
      "Police SI Coaching, Sub Inspector Coaching, TNUSRB SI Coaching, Police SI Training, SI Coaching in Tamil Nadu, TNUSRB Sub Inspector coaching Vellore",
    ogImage: "/assets/images/courses/course-sub-inspector.jpg",
  },
  "tnusrb-landing": {
    title: "TNUSRB Police Constable Coaching in Tamil Nadu | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Best TNUSRB Police Constable coaching in Tamil Nadu with written exam preparation, PET training, study materials, mock tests, hostel facility and selection support at Star Police Academy.",
    keywords:
      "TNUSRB Coaching, Police Constable Coaching, TNUSRB Constable, Police Constable Exam Coaching, TNUSRB PC Coaching Tamil Nadu, constable coaching Vellore",
    ogImage: "/assets/images/courses/course-tnusrb-constable.jpg",
  },
  "army-landing": {
    title: "Indian Army Agnipath Coaching | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Prepare for Indian Army Agnipath recruitment with written exam coaching, physical fitness training, medical readiness guidance and study support at Star Police Academy, Vellore.",
    keywords:
      "Indian Army coaching, Agnipath coaching Tamil Nadu, army exam coaching Vellore, defence coaching centre",
    ogImage: "/assets/images/courses/course-indian-army.jpg",
  },
  "navy-landing": {
    title: "Indian Navy Agnipath Coaching | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Prepare for Indian Navy recruitment with exam coaching, physical training, medical guidance and mentorship at Star Police Academy, Tamil Nadu.",
    keywords:
      "Indian Navy coaching, Agnipath navy coaching, navy exam coaching Tamil Nadu, defence coaching Vellore",
    ogImage: "/assets/images/courses/course-indian-navy.jpg",
  },
  "air-force-landing": {
    title: "Indian Air Force Coaching | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Indian Air Force exam coaching with syllabus coverage, physical preparation, mock tests and career guidance at Star Police Academy in Vellore.",
    keywords:
      "Indian Air Force coaching, IAF coaching Tamil Nadu, air force exam coaching Vellore, defence exam coaching",
    ogImage: "/assets/images/courses/course-indian-air-force.jpg",
  },
  "rpf-landing": {
    title: "Railway Protection Force RPF Coaching | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Railway Protection Force coaching with written exam preparation, PET guidance, study materials and physical training support at Star Police Academy.",
    keywords:
      "RPF coaching, Railway Protection Force coaching Tamil Nadu, RPF exam coaching Vellore",
    ogImage: "/assets/images/courses/course-rpf.jpg",
  },
  "capf-landing": {
    title: "CRPF CISF SSB ITBP CAPF Coaching | Star Police Academy",
    useBrandSuffix: false,
    description:
      "CAPF coaching for CRPF, CISF, SSB and ITBP exams with classroom training, physical preparation, mock tests and expert faculty at Star Police Academy.",
    keywords:
      "CAPF coaching, CRPF coaching, CISF coaching, SSB coaching, ITBP coaching Tamil Nadu",
    ogImage: "/assets/images/courses/course-capf.jpg",
  },
  register: {
    title: "Apply for TNUSRB Coaching | Star Police Academy Registration",
    useBrandSuffix: false,
    description:
      "Register for TNUSRB SI, Police Constable and defence exam coaching batches at Star Police Academy. Apply online for admissions, hostel and counselling support.",
    keywords:
      "TNUSRB registration, police coaching admission, Star Police Academy apply, SI coaching registration",
    ogImage: DEFAULT_OG_IMAGE,
  },
  contact: {
    title: "Contact Star Police Academy | TNUSRB Coaching Vellore",
    useBrandSuffix: false,
    description:
      "Contact Star Police Academy in Vellore for TNUSRB coaching admissions, fees, hostel, batch details and counselling. Call +91 9363 459 430 or email us today.",
    keywords:
      "contact Star Police Academy, TNUSRB coaching Vellore contact, police coaching phone number, Star Police Academy address",
    ogImage: DEFAULT_OG_IMAGE,
  },
  faq: {
    title: "TNUSRB Coaching FAQ | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Find answers about TNUSRB SI and Police Constable coaching fees, hostel, physical training, mock tests, course duration and admissions at Star Police Academy.",
    keywords:
      "TNUSRB FAQ, police coaching questions, SI coaching FAQ, constable coaching fees, hostel facility police academy",
    ogImage: DEFAULT_OG_IMAGE,
  },
  materials: {
    title: "TNUSRB Study Materials & Books | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Access TNUSRB SI and Police Constable study materials, books and exam preparation resources recommended by Star Police Academy faculty in Vellore.",
    keywords:
      "TNUSRB study materials, police exam books, SI coaching books, constable study guide Tamil Nadu",
    ogImage: DEFAULT_OG_IMAGE,
  },
  questions: {
    title: "TNUSRB Question Papers | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Download and practice TNUSRB SI and Police Constable previous year question papers with Star Police Academy exam preparation resources.",
    keywords:
      "TNUSRB question papers, police exam previous papers, SI question paper, constable exam papers",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "answer-keys": {
    title: "TNUSRB Answer Keys | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Review TNUSRB SI and Police Constable answer keys and exam solutions to improve accuracy and performance with Star Police Academy guidance.",
    keywords:
      "TNUSRB answer key, police exam answer key, SI answer key, constable answer key Tamil Nadu",
    ogImage: DEFAULT_OG_IMAGE,
  },
  notification: {
    title: "TNUSRB Recruitment Notifications | Star Police Academy",
    useBrandSuffix: false,
    description:
      "Stay updated with latest TNUSRB SI and Police Constable recruitment notifications, exam dates, application details and coaching batch alerts.",
    keywords:
      "TNUSRB notification, police recruitment notification, SI recruitment Tamil Nadu, constable notification updates",
    ogImage: DEFAULT_OG_IMAGE,
  },
  youtube: {
    title: "Star Police Academy Videos | TNUSRB Coaching",
    useBrandSuffix: false,
    description:
      "Watch Star Police Academy coaching videos, classroom sessions, physical training highlights and TNUSRB exam preparation guidance on YouTube.",
    keywords:
      "Star Police Academy videos, TNUSRB coaching videos, police coaching YouTube, SI coaching classes",
    ogImage: DEFAULT_OG_IMAGE,
  },
  toppers: {
    title: "Toppers and Achievers | Star Police Academy Results",
    useBrandSuffix: false,
    description:
      "Meet Star Police Academy toppers and successful TNUSRB SI and Police Constable aspirants who achieved their goals with expert coaching and training.",
    keywords:
      "Star Police Academy toppers, TNUSRB results, police coaching success stories, SI toppers Tamil Nadu",
    ogImage: "/assets/images/gallery/gallery-classroom-session.jpg",
  },
};

function absoluteUrl(path) {
  if (!path) {
    return SITE_URL;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getCourseByKey(courseKey) {
  return courses.find((course) => course.key === courseKey) || null;
}

function resolveCanonicalPath(page) {
  if (!page) {
    return "/";
  }

  if (page.type === "course" && page.courseKey) {
    return courseCanonicalByKey[page.courseKey] || `/${page.courseKey}`;
  }

  return canonicalByType[page.type] || "/";
}

function buildDocumentTitle(page, defaults, routeTitle) {
  if (defaults?.title) {
    return defaults.title;
  }

  if (page?.type === "course" && page.courseKey) {
    const course = getCourseByKey(page.courseKey);
    if (course?.title) {
      return `${course.title} | ${BRAND_NAME}`;
    }
  }

  if (routeTitle) {
    return `${routeTitle} | ${BRAND_NAME}`;
  }

  return academy.title;
}

function buildDescription(page, defaults, routeDescription) {
  if (defaults?.description) {
    return defaults.description;
  }

  if (routeDescription) {
    return routeDescription;
  }

  if (page?.type === "course" && page.courseKey) {
    const course = getCourseByKey(page.courseKey);
    if (course?.summary) {
      return course.summary;
    }
  }

  return academy.description;
}

function buildKeywords(page, defaults) {
  if (defaults?.keywords) {
    return defaults.keywords;
  }

  if (page?.type === "course" && page.courseKey) {
    const course = getCourseByKey(page.courseKey);
    if (course) {
      return `${course.shortTitle}, ${course.title}, ${BRAND_NAME}, TNUSRB coaching, police exam coaching Tamil Nadu`;
    }
  }

  return `${BRAND_NAME}, TNUSRB coaching, police coaching Tamil Nadu, SI coaching, constable coaching Vellore`;
}

function buildOgImage(page, defaults) {
  if (defaults?.ogImage) {
    return defaults.ogImage;
  }

  if (page?.type === "course" && page.courseKey) {
    const course = getCourseByKey(page.courseKey);
    if (course?.image) {
      return course.image;
    }
  }

  return DEFAULT_OG_IMAGE;
}

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORGANIZATION_ID,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: absoluteUrl(academy.logo),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: typeSeoDefaults.home.description,
    founder: {
      "@type": "Person",
      name: academy.founder,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Anandham Nagar, 85, Thirumalaikodi, Ussoor",
      addressLocality: "Vellore",
      addressRegion: "Tamil Nadu",
      postalCode: "632105",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contact.phonePrimary.replace(/\s/g, ""),
      email: contact.email,
      contactType: "Customer Support",
      areaServed: "IN",
      availableLanguage: ["English", "Tamil"],
    },
    telephone: contact.phonePrimary.replace(/\s/g, ""),
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
    sameAs: socialLinks.map((item) => item.href),
  };
}

function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
  };
}

function buildFaqSchema(faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildCourseSchema(page, title, description, ogImage) {
  const course = page?.courseKey ? getCourseByKey(page.courseKey) : null;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course?.title || title,
    description,
    provider: {
      "@id": ORGANIZATION_ID,
    },
    image: absoluteUrl(ogImage),
    offers: {
      "@type": "Offer",
      category: "Paid",
      url: absoluteUrl(resolveCanonicalPath(page)),
    },
  };
}

function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services#service`,
    name: "Police & Defence Exam Coaching",
    url: absoluteUrl("/services"),
    serviceType: "Police Exam Coaching",
    provider: {
      "@id": ORGANIZATION_ID,
    },
    areaServed: {
      "@type": "State",
      name: "Tamil Nadu",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Police & Defence Coaching Programs",
      itemListElement: courses.map((course) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: course.shortTitle,
          description: course.summary,
        },
      })),
    },
  };
}

function buildSchemas(page, title, description, ogImage) {
  const schemas = [buildOrganizationSchema(), buildWebsiteSchema()];

  if (page?.type === "courses") {
    schemas.push(buildServiceSchema());
  }

  if (page?.type === "faq") {
    schemas.push(buildFaqSchema(faqs));
  }

  if (
    page?.type === "course" ||
    page?.type === "si-landing" ||
    page?.type === "tnusrb-landing" ||
    page?.type === "army-landing" ||
    page?.type === "navy-landing" ||
    page?.type === "air-force-landing" ||
    page?.type === "rpf-landing" ||
    page?.type === "capf-landing"
  ) {
    schemas.push(buildCourseSchema(page, title, description, ogImage));
  }

  return schemas;
}

function buildPageSeo(page, requestPath = "/") {
  const pageType = page?.type || "home";
  const defaults = typeSeoDefaults[pageType] || typeSeoDefaults.home;
  const canonicalPath = resolveCanonicalPath(page);
  const title = buildDocumentTitle(page, defaults, page?.title);
  const description = buildDescription(page, defaults, page?.metaDescription);
  const keywords = buildKeywords(page, defaults);
  const ogImage = buildOgImage(page, defaults);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const ogUrl = absoluteUrl(cleanRequestPath(requestPath));

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    ogUrl,
    ogImage: absoluteUrl(ogImage),
    ogType: "website",
    siteName: BRAND_NAME,
    author: BRAND_NAME,
    language: "en-IN",
    geoRegion: "IN-TN",
    geoPlaceName: "Vellore, Tamil Nadu, India",
    favicon: FAVICON,
    logo: absoluteUrl(academy.logo),
    schemas: buildSchemas(page, title, description, ogImage),
  };
}

function cleanRequestPath(path = "/") {
  const withoutQuery = path.split("?")[0].split("#")[0];
  return withoutQuery.replace(/\/+$/, "") || "/";
}

module.exports = {
  BRAND_NAME,
  SITE_URL,
  absoluteUrl,
  buildPageSeo,
  resolveCanonicalPath,
};
