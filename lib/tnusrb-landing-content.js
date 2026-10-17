const { courses } = require("./star-content");

const tnusrbCourse = courses.find((course) => course.key === "tnusrb");
const powerOfConstableSection = tnusrbCourse.sections.find((section) => section.title === "Power of Constable");

const tnusrbLandingSeo = {
  title: tnusrbCourse.title,
  metaDescription: tnusrbCourse.summary,
  canonicalPath: "/tnusrb",
  keywords:
    "TNUSRB Coaching, Police Constable Coaching, TNUSRB Constable, Police Constable Exam Coaching, TNUSRB PC Coaching Tamil Nadu",
};

const tnusrbTrustPoints = [
  { icon: "military_tech", label: "14+ Years Coaching Experience" },
  { icon: "school", label: "TNUSRB Expert Faculty" },
  { icon: "menu_book", label: "Updated Constable Syllabus" },
  { icon: "quiz", label: "Daily Practice Tests" },
  { icon: "assignment", label: "Weekly Mock Test" },
  { icon: "fitness_center", label: "Physical Training" },
  { icon: "record_voice_over", label: "Interview Guidance" },
  { icon: "psychology", label: "Personality Development" },
  { icon: "library_books", label: "Study Materials Included" },
  { icon: "cast_for_education", label: "Online & Offline Classes" },
  { icon: "hotel", label: "Hostel Facility" },
  { icon: "payments", label: "Affordable Fees" },
];

const tnusrbCourseTopics = [
  {
    title: "TNUSRB Constable Recruitment",
    text: "Stay aligned with the latest TNUSRB Police Constable notification, exam pattern, and selection stages with structured classroom guidance.",
    icon: "badge",
    image: tnusrbCourse.image,
  },
  {
    title: "Written Exam Preparation",
    text: "Master General Studies, Psychology, Tamil, and Current Affairs through concept classes, revision, and exam-oriented practice.",
    icon: "menu_book",
    image: "/assets/images/gallery/gallery-classroom-session.jpg",
  },
  {
    title: "Physical Test Preparation",
    text: "Daily PET coaching for running, long jump, high jump, rope climbing, shot put, and endurance events on our dedicated training ground.",
    icon: "fitness_center",
    image: "/assets/images/gallery/gallery-outdoor-obstacle-course.jpg",
  },
  {
    title: "Certificate Verification",
    text: "Get document checklist support so your educational certificates and identity proofs are ready for TNUSRB verification without delays.",
    icon: "verified",
    image: "/assets/images/gallery/gallery-classroom-lecture.jpg",
  },
  {
    title: powerOfConstableSection.title,
    text: powerOfConstableSection.body[0],
    icon: "local_police",
    image: "/assets/images/gallery/gallery-defence-forces.jpg",
  },
  {
    title: "Final Selection Guidance",
    text: "End-to-end mentoring from application to medical examination so you understand every milestone in the constable selection journey.",
    icon: "military_tech",
    image: "/assets/images/gallery/gallery-training-ground.jpg",
  },
];

const tnusrbCourseFeatures = [
  "Complete TNUSRB Constable Syllabus",
  "Printed Study Materials",
  "Current Affairs",
  "Daily Practice Questions",
  "Weekly Mock Test",
  "Monthly Grand Test",
  "Previous Year Questions",
  "Physical Coaching",
  "Running Practice",
  "Individual Mentoring",
];

const tnusrbHeroHighlights = [
  "TNUSRB Constable Syllabus Coverage",
  "Daily Practice Tests",
  "Weekly Mock Exams",
  "Physical Training",
  "Study Materials Included",
  "Online & Offline Classes",
  "Hostel Facility",
];

const tnusrbSelectionProcessSteps = [
  {
    step: 1,
    title: "Written Examination",
    text: "Part A covers General Studies including History, Geography, Polity, Economics, Physics, Chemistry, Biology, Current Affairs and G.K. Part B covers Psychology.",
    icon: "edit_note",
  },
  {
    step: 2,
    title: "Physical Measurement Test",
    text: "Height and chest measurements are checked as per TNUSRB recruitment standards.",
    icon: "straighten",
  },
  {
    step: 3,
    title: "Physical Efficiency Test",
    text: "Endurance test and physical efficiency events including rope climbing, long jump or high jump, and running.",
    icon: "directions_run",
  },
  {
    step: 4,
    title: "Certificate Verification",
    text: "Original documents and educational certificates are verified by the recruitment board.",
    icon: "verified",
  },
  {
    step: 5,
    title: "Medical Examination",
    text: "Final medical fitness check before appointment to the Tamil Nadu Police department.",
    icon: "health_and_safety",
  },
  {
    step: 6,
    title: "Final Selection",
    text: "Selected candidates receive appointment orders to join as Tamil Nadu Police Constables.",
    icon: "military_tech",
  },
];

const tnusrbEligibilityRows = [
  { label: "Age", value: "18 to 28 years (relaxation as per TNUSRB rules for reserved categories)" },
  { label: "Education", value: "10th / 12th or equivalent qualification as per the current TNUSRB constable notification" },
  { label: "Community Relaxation", value: "Age and reservation benefits applicable for SC, ST, MBC, BC, and other eligible categories" },
  { label: "Sports Quota", value: "Sports quota candidates must meet TNUSRB sports certificate and achievement norms" },
  { label: "Reservation Details", value: "Horizontal and vertical reservations applied as per Tamil Nadu government recruitment policy" },
];

const tnusrbPhysicalEvents = [
  {
    title: "Height & Chest",
    text: "Physical Measurement Test checks minimum height and chest expansion standards for men, women, and transgender candidates as per TNUSRB notification.",
    icon: "height",
  },
  {
    title: "Running",
    text: "Sprint and endurance running drills build the stamina required for PET qualifying timings on the selection day.",
    icon: "directions_run",
  },
  {
    title: "Long Jump",
    text: "Technique coaching and repeated practice help you achieve the required distance with safe landing form.",
    icon: "sports_gymnastics",
  },
  {
    title: "High Jump",
    text: "Vertical leap training on professional ground improves take-off, body control, and clearance height.",
    icon: "trending_up",
  },
  {
    title: "Rope Climbing",
    text: "Upper body strength sessions prepare you for rope climbing events with supervised practice and progression.",
    icon: "fitness_center",
  },
  {
    title: "Shot Put",
    text: "Strength and throwing technique coaching develops power, balance, and distance for the shot put event.",
    icon: "sports_martial_arts",
  },
];

const tnusrbSyllabusSections = [
  {
    title: "General Studies",
    items: ["Indian History", "Geography", "Indian Polity", "Economics", "Physics", "Chemistry", "Biology", "Current Affairs"],
  },
  {
    title: "Psychology",
    items: ["Logical analysis", "Behavioural understanding", "Decision-making scenarios", "Situational judgement"],
  },
  {
    title: "Tamil",
    items: ["Grammar", "Comprehension", "Vocabulary", "Error detection", "Language-based aptitude"],
  },
  {
    title: "Current Affairs",
    items: ["National news", "State affairs", "Government schemes", "Awards and appointments", "Exam-focused discussions"],
  },
];

const tnusrbTrainingFlow = [
  "Daily Classes",
  "Revision",
  "Practice Test",
  "Mock Test",
  "Performance Analysis",
  "Physical Training",
  "Document Support",
  "Selection",
];

const tnusrbTrainingSpotlights = [
  {
    group: "mock",
    groupLabel: "Mock Tests",
    title: "OMR Practice",
    text: "Practice filling OMR sheets under timed exam conditions to build speed, accuracy, and real exam confidence.",
    icon: "fact_check",
  },
  {
    group: "mock",
    groupLabel: "Mock Tests",
    title: "Online Mock",
    text: "Take computer-based mock tests with instant scoring, topic-wise breakdown, and digital answer review.",
    icon: "computer",
  },
  {
    group: "mock",
    groupLabel: "Mock Tests",
    title: "Offline Mock",
    text: "Written mock exams in a classroom setup that mirrors TNUSRB exam hall discipline and paper pattern.",
    icon: "edit_note",
  },
  {
    group: "mock",
    groupLabel: "Mock Tests",
    title: "Rank Analysis",
    text: "Compare your score with batch rank, spot weak subjects, and track improvement across every test cycle.",
    icon: "leaderboard",
  },
  {
    group: "mock",
    groupLabel: "Mock Tests",
    title: "Individual Feedback",
    text: "Get one-on-one mentor feedback after major mocks so you know exactly what to improve before the next test.",
    icon: "reviews",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "Running",
    text: "Daily sprint and endurance running drills to meet PET qualifying timings on selection day.",
    icon: "directions_run",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "Long Jump",
    text: "Technique coaching and repeated practice help you achieve the required distance with safe landing form.",
    icon: "sports_gymnastics",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "High Jump",
    text: "Vertical leap training on professional ground improves take-off, body control, and clearance height.",
    icon: "trending_up",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "Rope Climbing",
    text: "Upper body strength sessions prepare you for rope climbing with supervised practice and progression.",
    icon: "fitness_center",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "Shot Put",
    text: "Strength and throwing technique coaching develops power, balance, and distance for the shot put event.",
    icon: "sports_martial_arts",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "Endurance",
    text: "Structured stamina sessions build the endurance needed for long PET events and selection-day fitness.",
    icon: "monitor_heart",
  },
  {
    group: "physical",
    groupLabel: "Physical Training",
    title: "Fitness Training",
    text: "Full-body conditioning workouts improve agility, core strength, and overall physical readiness for TNUSRB PET.",
    icon: "exercise",
  },
];

const tnusrbStudyMaterials = [
  "Printed Notes",
  "Current Affairs Book",
  "Practice Workbook",
  "Previous Year Papers",
  "Monthly Magazine",
  "PDF Materials",
];

const tnusrbFacultyCards = [
  { title: "Retired Police Officers", text: "Learn from experienced former Tamil Nadu police personnel who understand real service expectations.", icon: "local_police" },
  { title: "Subject Experts", text: "Dedicated faculty for GK, psychology, Tamil, and exam-oriented concept building.", icon: "school" },
  { title: "Physical Trainers", text: "Former police fitness trainers supervise daily PET drills and obstacle-style preparation.", icon: "fitness_center" },
  { title: "Career Mentors", text: "Guidance on documentation, batch planning, and constable recruitment readiness.", icon: "groups" },
];

const tnusrbLearningModes = [
  { title: "Offline", text: "Classroom coaching at Star Police Academy, Vellore with daily attendance and faculty interaction.", icon: "domain" },
  { title: "Online Live", text: "Live online classes for aspirants who want expert guidance with flexible remote access.", icon: "videocam" },
  { title: "Recorded Classes", text: "Recorded concept videos for revision after class hours and missed-session recovery.", icon: "play_circle" },
  { title: "Weekend Batch", text: "Weekend-focused batches suitable for college students and working professionals.", icon: "calendar_month" },
  { title: "Fast Track Batch", text: "Accelerated preparation track for candidates targeting the upcoming TNUSRB constable notification.", icon: "bolt" },
  { title: "Crash Course", text: "Intensive revision, mock tests, and PET tune-up before the examination window.", icon: "timer" },
];

const tnusrbFeeHighlights = [
  "Installment Facility",
  "Scholarship for deserving students",
  "Education loan support guidance",
  "Limited period enrollment offers",
];

const tnusrbBatches = [
  { title: "Morning Batch", time: "6:30 AM – 11:30 AM", mode: "Classroom + PET" },
  { title: "Evening Batch", time: "4:00 PM – 8:30 PM", mode: "Classroom + PET" },
  { title: "Weekend Batch", time: "Sat & Sun", mode: "Written + physical" },
  { title: "Online Batch", time: "Flexible schedule", mode: "Live + recorded support" },
];

const tnusrbFaqs = [
  { question: "Which is the best police coaching centre in Tamil Nadu?", answer: "Star Police Academy in Vellore is widely regarded as one of Tamil Nadu's leading TNUSRB coaching centres, with 10+ years of experience, expert faculty, physical training, hostel facilities and a strong placement record." },
  { question: "What is the fee structure for TNUSRB coaching?", answer: "Fees vary by course (SI, Constable, Defence, etc.). Contact our admissions team at +91 9363 459 430 or visit our office for the latest fee structure and available seats." },
  { question: "Is hostel available?", answer: "Yes. Star Police Academy offers separate hostel facilities for both men and women. Safe, secure, and comfortable accommodation is available for outstation students near our coaching centre in Vellore." },
  { question: "Do you provide physical training?", answer: "Yes. We offer dedicated physical training including running, long jump, high jump, shot put, rope climbing, endurance and obstacle training on our training ground." },
  { question: "How long is the coaching course?", answer: "Course duration depends on the exam and batch. SI and Constable programmes typically run for several months with structured classroom, test and physical preparation." },
  { question: "Are mock tests conducted?", answer: "Yes. Daily mock tests and weekly assessments are conducted to track progress and prepare students for TNUSRB written examinations." },
  { question: "Is study material provided?", answer: "Yes. Updated study materials, current affairs notes and previous year question papers are provided to all enrolled students." },
  { question: "Can beginners join?", answer: "Absolutely. Beginners are welcome. Our structured programme covers basics to advanced preparation for every stage of TNUSRB selection." },
  { question: "Do you conduct PET coaching?", answer: "Yes. Physical Efficiency Test (PET) and Physical Measurement Test (PMT) coaching is a core part of our TNUSRB preparation programme." },
  { question: "What documents are required?", answer: "Educational certificates, ID proof, photographs and completed application form are required. Our team will guide you through the full admission process." },
];

const tnusrbInternalLinks = [
  { label: "Home", href: "/" },
  { label: "Police SI Coaching", href: "/police-sub-inspector-coaching" },
  { label: "Physical Training Program", href: "/training" },
  { label: "Success Stories", href: "/toppers" },
  { label: "Contact Us", href: "/contact" },
  { label: "About Us", href: "/about" },
];

module.exports = {
  tnusrbCourse,
  powerOfConstableSection,
  tnusrbLandingSeo,
  tnusrbTrustPoints,
  tnusrbCourseTopics,
  tnusrbCourseFeatures,
  tnusrbHeroHighlights,
  tnusrbSelectionProcessSteps,
  tnusrbEligibilityRows,
  tnusrbPhysicalEvents,
  tnusrbSyllabusSections,
  tnusrbTrainingFlow,
  tnusrbTrainingSpotlights,
  tnusrbStudyMaterials,
  tnusrbFacultyCards,
  tnusrbLearningModes,
  tnusrbFeeHighlights,
  tnusrbBatches,
  tnusrbFaqs,
  tnusrbInternalLinks,
};
