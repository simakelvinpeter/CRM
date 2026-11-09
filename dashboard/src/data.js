import {
  LayoutDashboard,
  Users,
  Files,
  CalendarDays,
  Building2,
  Search,
  Wallet,
  ChartNoAxesCombined,
} from "lucide-react";

// Arrays use square brackets. Each object inside describes one menu group.
export const navigationGroups = [
  {
    title: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard },
      { label: "Students", icon: Users },
      { label: "Applications", icon: Files },
      { label: "Tasks & Calendar", icon: CalendarDays },
    ],
  },
  {
    title: "Partnerships",
    items: [
      { label: "University Partners", icon: Building2 },
      { label: "Course Search", icon: Search },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Commissions", icon: Wallet },
      { label: "Team", icon: Users },
      { label: "Reports", icon: ChartNoAxesCombined },
    ],
  },
];

// Demo records only. A database will replace this starting data later.
export const initialStudents = [
  {
    id: "SG-001",
    name: "Amina Hassan",
    email: "amina@example.com",
    country: "United Kingdom",
    subject: "Business analytics",
    intake: "Sep 2027",
    budget: 25000,
    stage: "Applying",
    counsellor: "Grace Wanjiku",
    nextAction: "Upload English result",
  },
  {
    id: "SG-002",
    name: "Daniel Okafor",
    email: "daniel@example.com",
    country: "Canada",
    subject: "Project management",
    intake: "Sep 2027",
    budget: 30000,
    stage: "Offer",
    counsellor: "Tariq Bello",
    nextAction: "Accept university offer",
  },
  {
    id: "SG-003",
    name: "Priya Shah",
    email: "priya@example.com",
    country: "Australia",
    subject: "Public health",
    intake: "Sep 2027",
    budget: 24000,
    stage: "Visa",
    counsellor: "Grace Wanjiku",
    nextAction: "Prepare visa documents",
  },
  {
    id: "SG-004",
    name: "Lucas Mendes",
    email: "lucas@example.com",
    country: "United Kingdom",
    subject: "Finance",
    intake: "Sep 2027",
    budget: 22000,
    stage: "Counselling",
    counsellor: "James Cole",
    nextAction: "Review course shortlist",
  },
  {
    id: "SG-005",
    name: "Mei Chen",
    email: "mei@example.com",
    country: "Ireland",
    subject: "Computer science",
    intake: "Sep 2027",
    budget: 21000,
    stage: "Pre-departure",
    counsellor: "Tariq Bello",
    nextAction: "Confirm flight details",
  },
];

export const partners = [
  {
    id: "UNI-01",
    name: "Westbridge University",
    country: "United Kingdom",
    contract: "Signed",
    commission: "16% of first-year tuition",
    currency: "GBP",
    expiry: "31 Dec 2027",
  },
  {
    id: "UNI-02",
    name: "Northlake University",
    country: "Canada",
    contract: "Signed",
    commission: "15% of first-year tuition",
    currency: "CAD",
    expiry: "30 Jun 2028",
  },
  {
    id: "UNI-03",
    name: "Southern Coast Institute",
    country: "Australia",
    contract: "Signed",
    commission: "12% of first-year tuition",
    currency: "AUD",
    expiry: "30 Jun 2028",
  },
  {
    id: "UNI-04",
    name: "Dublin Central University",
    country: "Ireland",
    contract: "Awaiting signature",
    commission: "EUR 3,200 per enrolment",
    currency: "EUR",
    expiry: "Not yet signed",
  },
];

// studentId links an application to a student; universityId links its partner.
export const initialApplications = [
  {
    id: "APP-101",
    studentId: "SG-001",
    universityId: "UNI-01",
    course: "MSc Business Analytics",
    status: "Conditional offer",
    deadline: "2027-06-18",
  },
  {
    id: "APP-102",
    studentId: "SG-002",
    universityId: "UNI-02",
    course: "MSc Project Management",
    status: "Unconditional offer",
    deadline: "2027-06-20",
  },
  {
    id: "APP-103",
    studentId: "SG-003",
    universityId: "UNI-03",
    course: "Master of Public Health",
    status: "Unconditional offer",
    deadline: "2027-07-02",
  },
  {
    id: "APP-104",
    studentId: "SG-001",
    universityId: "UNI-02",
    course: "MSc Applied Analytics",
    status: "Under review",
    deadline: "2027-06-24",
  },
  {
    id: "APP-105",
    studentId: "SG-001",
    universityId: "UNI-03",
    course: "Master of Business",
    status: "Rejected",
    deadline: "",
  },
];

export const initialTasks = [
  {
    id: "TASK-1",
    title: "Call Daniel about offer acceptance",
    owner: "Tariq Bello",
    date: "2027-06-12",
    time: "11:30",
    done: false,
  },
  {
    id: "TASK-2",
    title: "Review Amina’s English result",
    owner: "Grace Wanjiku",
    date: "2027-06-18",
    time: "14:00",
    done: false,
  },
  {
    id: "TASK-3",
    title: "Priya — visa document check",
    owner: "Grace Wanjiku",
    date: "2027-06-12",
    time: "16:30",
    done: false,
  },
];

export const team = [
  { name: "Grace Wanjiku", role: "Senior counsellor" },
  { name: "Tariq Bello", role: "Admissions counsellor" },
  { name: "James Cole", role: "Admissions officer" },
];

export const journeyStages = [
  "Enquiry",
  "Counselling",
  "Applying",
  "Offer",
  "Visa",
  "Pre-departure",
  "Arrived",
  "Enrolled",
];
export const applicationStatuses = [
  "Draft",
  "Documents required",
  "Submitted",
  "Under review",
  "Conditional offer",
  "Unconditional offer",
  "Rejected",
  "Withdrawn",
  "Deferred",
];
