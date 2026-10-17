const courseRouteMap = {
  tnusrb: "tnusrb",
  subinspector: "sub-inspector",
  "sub-inspector": "sub-inspector",
  indianarmy: "indian-army",
  "indian-army": "indian-army",
  indiannavy: "indian-navy",
  "indian-navy": "indian-navy",
  indianairforce: "indian-air-force",
  "indian-air-force": "indian-air-force",
  rpf: "rpf",
  "other-course": "capf",
  capf: "capf",
};

const staticRoutes = {
  "/": { type: "home", title: "Home" },
  "/police-sub-inspector-coaching": {
    type: "si-landing",
    title: "Police SI Coaching in Tamil Nadu",
    metaDescription:
      "Join the best Police Sub Inspector Coaching in Tamil Nadu. Expert faculty, TNUSRB syllabus, mock tests, physical training & high success rate. Enroll Today.",
  },
  "/tnusrb-police-sub-inspector-coaching": {
    type: "si-landing",
    title: "TNUSRB Police Sub Inspector Coaching",
    metaDescription:
      "Prepare for TNUSRB Police Sub Inspector recruitment with written exam coaching, physical training, mock tests and interview guidance at Star Police Academy.",
  },
  "/index": { type: "home", title: "Home" },
  "/index.php": { type: "home", title: "Home" },
  "/about": { type: "about", title: "About Star Police Academy" },
  "/about.php": { type: "about", title: "About Star Police Academy" },
  "/courses": { type: "courses", title: "Courses" },
  "/service": { type: "courses", title: "Courses" },
  "/services": { type: "courses", title: "Courses" },
  "/training": { type: "courses", title: "Training" },
  "/register": { type: "register", title: "Students Application" },
  "/register.php": { type: "register", title: "Students Application" },
  "/signup": { type: "register", title: "Students Application" },
  "/login": { type: "register", title: "Students Application" },
  "/contact": { type: "contact", title: "Contact Star Police Academy" },
  "/contact-us": { type: "contact", title: "Contact Star Police Academy" },
  "/contact.php": { type: "contact", title: "Contact Star Police Academy" },
  "/faq": { type: "faq", title: "Frequently Asked Questions" },
  "/toppers": { type: "toppers", title: "Toppers and Achievers" },
  "/toppers.php": { type: "toppers", title: "Toppers and Achievers" },
  "/star-police-academy-toppers-and-achievers": { type: "toppers", title: "Toppers and Achievers" },
  "/gallery": { type: "toppers", title: "Toppers and Achievers" },
  "/blog": { type: "toppers", title: "Toppers and Achievers" },
  "/blog-details": { type: "toppers", title: "Toppers and Achievers" },
  "/materials": { type: "materials", title: "Training Materials" },
  "/materials.php": { type: "materials", title: "Training Materials" },
  "/star-police-academy-training-materials": { type: "materials", title: "Training Materials" },
  "/questions": { type: "questions", title: "Questions Paper" },
  "/questions.php": { type: "questions", title: "Questions Paper" },
  "/star-police-academy-question-papers": { type: "questions", title: "Questions Paper" },
  "/ansewrkey": { type: "answer-keys", title: "Answer Keys" },
  "/ansewrkey.php": { type: "answer-keys", title: "Answer Keys" },
  "/star-police-academy-answer-keys": { type: "answer-keys", title: "Answer Keys" },
  "/notification": { type: "notification", title: "Recruitment Notification" },
  "/notification.php": { type: "notification", title: "Recruitment Notification" },
  "/star-police-academy-current-affairs": { type: "notification", title: "Current Affairs" },
  "/youtube": { type: "youtube", title: "Our Recent Videos" },
  "/youtube.php": { type: "youtube", title: "Our Recent Videos" },
  "/star-police-academy-youtube": { type: "youtube", title: "Our Recent Videos" },
  "/test-batch": { type: "notification", title: "Test Batches", bannerTitle: "Test Batches" },
  "/test-batch.php": { type: "notification", title: "Test Batches", bannerTitle: "Test Batches" },
  "/star-police-academy-test-batches": { type: "notification", title: "Test Batches", bannerTitle: "Test Batches" },
  "/instructors": { type: "about", title: "About Star Police Academy" },
  "/profile": { type: "about", title: "About Star Police Academy" },
  "/events": { type: "courses", title: "Courses" },
  "/events-right-sidebar": { type: "courses", title: "Courses" },
  "/events-single": { type: "course", title: "Tamilnadu Police Constable TNUSRB", courseKey: "tnusrb" },
  "/coureses-grid": { type: "courses", title: "Courses" },
  "/coureses-list": { type: "courses", title: "Courses" },
  "/coureses-right-sidebar": { type: "courses", title: "Courses" },
  "/coureses-single": { type: "course", title: "Tamilnadu Police Constable TNUSRB", courseKey: "tnusrb" },
};

for (const [sourceKey, courseKey] of Object.entries(courseRouteMap)) {
  staticRoutes[`/${sourceKey}`] = {
    type: "course",
    title: courseKey,
    courseKey,
  };
  staticRoutes[`/${sourceKey}.php`] = {
    type: "course",
    title: courseKey,
    courseKey,
  };
}

staticRoutes["/indian-army"] = {
  type: "army-landing",
  title: "Agnipath - Indian Army",
  metaDescription:
    "Prepare for the Indian Army Agnipath pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/agnipath-indian-army-coaching"] = {
  type: "army-landing",
  title: "Agnipath - Indian Army Coaching",
  metaDescription:
    "Prepare for the Indian Army Agnipath pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indian-army.php"] = {
  type: "army-landing",
  title: "Agnipath - Indian Army",
  metaDescription:
    "Prepare for the Indian Army Agnipath pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indianarmy"] = {
  type: "army-landing",
  title: "Agnipath - Indian Army",
  metaDescription:
    "Prepare for the Indian Army Agnipath pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indianarmy.php"] = {
  type: "army-landing",
  title: "Agnipath - Indian Army",
  metaDescription:
    "Prepare for the Indian Army Agnipath pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};

staticRoutes["/indian-navy"] = {
  type: "navy-landing",
  title: "Agnipath - Indian Navy",
  metaDescription:
    "Prepare for the Indian Navy pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/agnipath-indian-navy-coaching"] = {
  type: "navy-landing",
  title: "Agnipath - Indian Navy Coaching",
  metaDescription:
    "Prepare for the Indian Navy pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indian-navy.php"] = {
  type: "navy-landing",
  title: "Agnipath - Indian Navy",
  metaDescription:
    "Prepare for the Indian Navy pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indiannavy"] = {
  type: "navy-landing",
  title: "Agnipath - Indian Navy",
  metaDescription:
    "Prepare for the Indian Navy pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indiannavy.php"] = {
  type: "navy-landing",
  title: "Agnipath - Indian Navy",
  metaDescription:
    "Prepare for the Indian Navy pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};

staticRoutes["/indian-air-force"] = {
  type: "air-force-landing",
  title: "Indian Air Force",
  metaDescription:
    "Prepare for the Indian Air Force pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indian-air-force-coaching"] = {
  type: "air-force-landing",
  title: "Indian Air Force Coaching",
  metaDescription:
    "Prepare for the Indian Air Force pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indian-air-force.php"] = {
  type: "air-force-landing",
  title: "Indian Air Force",
  metaDescription:
    "Prepare for the Indian Air Force pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indianairforce"] = {
  type: "air-force-landing",
  title: "Indian Air Force",
  metaDescription:
    "Prepare for the Indian Air Force pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/indianairforce.php"] = {
  type: "air-force-landing",
  title: "Indian Air Force",
  metaDescription:
    "Prepare for the Indian Air Force pathway with written exam support, physical fitness guidance, medical readiness, and online resources.",
};

staticRoutes["/rpf"] = {
  type: "rpf-landing",
  title: "Railway Protection Force RPF",
  metaDescription:
    "Prepare for the Railway Protection Force with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/railway-protection-force"] = {
  type: "rpf-landing",
  title: "Railway Protection Force",
  metaDescription:
    "Prepare for the Railway Protection Force with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/railway-protection-force-coaching"] = {
  type: "rpf-landing",
  title: "Railway Protection Force Coaching",
  metaDescription:
    "Prepare for the Railway Protection Force with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/rpf.php"] = {
  type: "rpf-landing",
  title: "Railway Protection Force RPF",
  metaDescription:
    "Prepare for the Railway Protection Force with written exam support, physical fitness guidance, medical readiness, and online resources.",
};

staticRoutes["/capf"] = {
  type: "capf-landing",
  title: "CRPF,CISF,SSB,ITBF Course",
  metaDescription:
    "Prepare for CAPF with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/crpf-cisf-ssb-itbf-coaching"] = {
  type: "capf-landing",
  title: "CRPF, CISF, SSB, ITBF Coaching",
  metaDescription:
    "Prepare for CAPF with written exam support, physical fitness guidance, medical readiness, and online resources.",
};
staticRoutes["/capf.php"] = {
  type: "capf-landing",
  title: "CRPF,CISF,SSB,ITBF Course",
  metaDescription:
    "Prepare for CAPF with written exam support, physical fitness guidance, medical readiness, and online resources.",
};

staticRoutes["/tnusrb"] = {
  type: "tnusrb-landing",
  title: "Tamilnadu Police Constable TNUSRB",
  metaDescription:
    "Explore our Tamilnadu Police Constable TNUSRB Course with focused police exam coaching and physical preparation.",
};
staticRoutes["/tnusrb-police-constable-coaching"] = {
  type: "tnusrb-landing",
  title: "TNUSRB Police Constable Coaching",
  metaDescription:
    "Explore TNUSRB Police Constable coaching with focused written exam preparation and physical training at Star Police Academy.",
};
staticRoutes["/tnusrb.php"] = {
  type: "tnusrb-landing",
  title: "Tamilnadu Police Constable TNUSRB",
  metaDescription:
    "Explore our Tamilnadu Police Constable TNUSRB Course with focused police exam coaching and physical preparation.",
};

const knownRouteAliases = Array.from(
  new Set(Object.keys(staticRoutes))
);

function cleanRoute(route = "/") {
  const withoutQuery = route.split("?")[0].split("#")[0];
  let clean = withoutQuery.replace(/\/+$/, "") || "/";

  return clean;
}

function resolveStarRoute(route = "/") {
  const clean = cleanRoute(route);
  return staticRoutes[clean] || null;
}

const knownRoutes = Array.from(
  new Set(
    Object.keys(staticRoutes).filter((route) => !route.endsWith(".php") && route !== "/index")
  )
);

module.exports = {
  knownRouteAliases,
  knownRoutes,
  resolveStarRoute,
};
