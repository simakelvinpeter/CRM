// Business rules live here so the interface and tests use the same rules.
export const SCHEMA_VERSION = 2;
export const currencies = ["USD", "GBP", "EUR", "CAD", "AUD", "KES"];
export const stages = [
  "Enquiry",
  "Counselling",
  "Shortlisting",
  "Applying",
  "Offer",
  "Visa",
  "Pre-departure",
  "Arrived",
  "Enrolled",
  "Deferred",
  "Withdrawn",
];
export const statuses = [
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
export const roles = [
  "Agency owner",
  "Finance manager",
  "Counsellor",
  "Referral agent",
];
export const financeAllowed = (role) =>
  ["Agency owner", "Finance manager"].includes(role);
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const uid = (prefix) => `${prefix}-${crypto.randomUUID()}`;
export function required(value, label) {
  if (typeof value !== "string" || !value.trim())
    throw Error(`${label} is required.`);
  return value.trim();
}
export function date(value, label, optional = true) {
  if (!value && optional) return "";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value
  )
    throw Error(`${label} must be a valid date.`);
  return value;
}
export function cents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value)))
    throw Error("Enter a non-negative amount with at most two decimal places.");
  const amount = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(amount)) throw Error("Amount is too large.");
  return amount;
}
export function paidTotal(record) {
  return record.payments.reduce((sum, p) => sum + p.amountCents, 0);
}
export function entitlementTotal(record) {
  return (
    record.amountCents +
    record.adjustments.reduce((sum, a) => sum + a.amountCents, 0)
  );
}
export function balance(record) {
  return entitlementTotal(record) - paidTotal(record);
}
export function commissionStatus(record) {
  return record.invoice
    ? balance(record) === 0
      ? "Paid"
      : paidTotal(record)
        ? "Partial payment"
        : record.invoice.due < today()
          ? "Overdue"
          : "Invoiced"
    : record.eligible
      ? "Eligible"
      : "Expected";
}
export function validateEmail(value) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    throw Error("Enter a valid email address.");
}
function number(value, label) {
  if (!Number.isFinite(Number(value)) || Number(value) < 0)
    throw Error(`${label} must be zero or greater.`);
}
function currency(value) {
  if (!currencies.includes(value)) throw Error("Select a supported currency.");
}
function ref(records, id, label) {
  const record = records.find((r) => r.id === id);
  if (!record) throw Error(`${label} does not exist.`);
  return record;
}
function enumValue(value, allowed, label) {
  if (!allowed.includes(value)) throw Error(`Invalid ${label}.`);
}
function write(records, record) {
  const index = records.findIndex((r) => r.id === record.id);
  if (index < 0) records.push(record);
  else records[index] = record;
}
function event(state, studentId, text, actor) {
  state.activity.unshift({
    id: uid("EVT"),
    studentId: studentId || "",
    text,
    date: new Date().toISOString(),
    actor: actor.name || "Agency administrator",
  });
}

export function createSeed() {
  const partners = [
    {
      id: "UNI-01",
      name: "Westbridge University",
      country: "United Kingdom",
      city: "London",
      type: "Direct partner",
      contact: "Emily Carter",
      email: "admissions@westbridge.example.com",
    },
    {
      id: "UNI-02",
      name: "Northlake University",
      country: "Canada",
      city: "Toronto",
      type: "Direct partner",
      contact: "Oliver Martin",
      email: "partners@northlake.example.com",
    },
    {
      id: "UNI-03",
      name: "Southern Coast Institute",
      country: "Australia",
      city: "Melbourne",
      type: "Direct partner",
      contact: "Amelia Wilson",
      email: "international@southerncoast.example.com",
    },
    {
      id: "UNI-04",
      name: "Dublin Central University",
      country: "Ireland",
      city: "Dublin",
      type: "Prospect",
      contact: "Aoife Kelly",
      email: "partners@dublincentral.example.com",
    },
  ];
  const students = [
    {
      id: "SG-001",
      name: "Amina Hassan",
      email: "amina@example.com",
      phone: "+254 700 555 014",
      nationality: "Kenya",
      city: "Nairobi",
      country: "United Kingdom",
      subject: "Business analytics",
      level: "Master’s degree",
      intake: "Sep 2027",
      budget: 25000,
      currency: "USD",
      stage: "Applying",
      counsellor: "Grace Wanjiku",
      nextAction: "Upload English result",
      deadline: "2027-06-18",
      education: "Bachelor of Commerce · University of Nairobi · 2024",
      grades: "Upper second class honours",
      english: "IELTS result pending",
      guardian: "Omar Hassan · father",
      shortlist: ["CRS-01"],
      archived: false,
    },
    {
      id: "SG-002",
      name: "Daniel Okafor",
      email: "daniel@example.com",
      phone: "",
      nationality: "Nigeria",
      city: "Lagos",
      country: "Canada",
      subject: "Project management",
      level: "Master’s degree",
      intake: "Sep 2027",
      budget: 30000,
      currency: "CAD",
      stage: "Offer",
      counsellor: "Tariq Bello",
      nextAction: "Accept university offer",
      deadline: "2027-06-20",
      shortlist: [],
      archived: false,
    },
    {
      id: "SG-003",
      name: "Priya Shah",
      email: "priya@example.com",
      phone: "",
      nationality: "Kenya",
      city: "Mombasa",
      country: "Australia",
      subject: "Public health",
      level: "Master’s degree",
      intake: "Sep 2027",
      budget: 36000,
      currency: "AUD",
      stage: "Visa",
      counsellor: "Grace Wanjiku",
      nextAction: "Prepare visa documents",
      deadline: "2027-06-13",
      shortlist: [],
      archived: false,
    },
    {
      id: "SG-004",
      name: "Lucas Mendes",
      email: "lucas@example.com",
      phone: "",
      nationality: "Brazil",
      city: "São Paulo",
      country: "United Kingdom",
      subject: "Finance",
      level: "Master’s degree",
      intake: "Sep 2027",
      budget: 22000,
      currency: "GBP",
      stage: "Counselling",
      counsellor: "James Cole",
      nextAction: "Review course shortlist",
      shortlist: [],
      archived: false,
    },
    {
      id: "SG-005",
      name: "Mei Chen",
      email: "mei@example.com",
      phone: "",
      nationality: "China",
      city: "Shanghai",
      country: "Ireland",
      subject: "Computer science",
      level: "Master’s degree",
      intake: "Sep 2027",
      budget: 21000,
      currency: "EUR",
      stage: "Pre-departure",
      counsellor: "Tariq Bello",
      nextAction: "Confirm flight details",
      shortlist: [],
      archived: false,
    },
  ];
  const courses = [
    {
      id: "CRS-01",
      universityId: "UNI-01",
      name: "MSc Business Analytics",
      subject: "Business analytics",
      level: "Master’s degree",
      duration: "1 year",
      tuition: 19500,
      currency: "GBP",
      intake: "Sep 2027",
      deadline: "2027-06-30",
      english: "IELTS 6.5",
      requirements:
        "Relevant bachelor’s degree, upper second class. IELTS 6.5 overall with no band below 6.0.",
      scholarship: "Up to GBP 3,000 merit award",
      source: "Demo partner course sheet",
      verified: "2027-06-08",
      archived: false,
    },
    {
      id: "CRS-02",
      universityId: "UNI-02",
      name: "MSc Project Management",
      subject: "Management",
      level: "Master’s degree",
      duration: "18 months",
      tuition: 32000,
      currency: "CAD",
      intake: "Sep 2027",
      deadline: "2027-07-01",
      english: "IELTS 7.0",
      requirements: "Recognised bachelor’s degree and personal statement.",
      scholarship: "Not confirmed",
      source: "Demo partner course sheet",
      verified: "2027-06-05",
      archived: false,
    },
    {
      id: "CRS-03",
      universityId: "UNI-03",
      name: "Master of Public Health",
      subject: "Public health",
      level: "Master’s degree",
      duration: "2 years",
      tuition: 36000,
      currency: "AUD",
      intake: "Sep 2027",
      deadline: "2027-07-02",
      english: "IELTS 6.5",
      requirements: "Relevant health degree. IELTS 6.5 overall.",
      scholarship: "10% international scholarship",
      source: "Demo partner course sheet",
      verified: "2027-06-01",
      archived: false,
    },
    {
      id: "CRS-04",
      universityId: "UNI-02",
      name: "MSc Applied Analytics",
      subject: "Data science",
      level: "Master’s degree",
      duration: "1 year",
      tuition: 28000,
      currency: "CAD",
      intake: "Sep 2027",
      deadline: "2027-07-15",
      english: "IELTS 6.5",
      requirements: "Quantitative bachelor’s degree.",
      scholarship: "Not confirmed",
      source: "Demo catalogue",
      verified: "",
      archived: false,
    },
    {
      id: "CRS-05",
      universityId: "UNI-03",
      name: "Master of Business",
      subject: "Business",
      level: "Master’s degree",
      duration: "2 years",
      tuition: 34000,
      currency: "AUD",
      intake: "Feb 2028",
      deadline: "2027-09-30",
      english: "IELTS 6.5",
      requirements: "Bachelor’s degree with strong academic results.",
      scholarship: "Not confirmed",
      source: "Demo catalogue",
      verified: "",
      archived: false,
    },
    {
      id: "CRS-06",
      universityId: "UNI-04",
      name: "MSc Computer Science",
      subject: "Computer science",
      level: "Master’s degree",
      duration: "1 year",
      tuition: 21000,
      currency: "EUR",
      intake: "Sep 2027",
      deadline: "2027-07-10",
      english: "IELTS 6.5",
      requirements: "Computing degree or relevant experience.",
      scholarship: "EUR 2,000 merit award",
      source: "Demo catalogue",
      verified: "2027-06-02",
      archived: false,
    },
  ];
  const agreements = partners.map((p, i) => ({
    id: `AGR-0${i + 1}`,
    universityId: p.id,
    name: "2027 recruitment agreement",
    status: i === 3 ? "Awaiting signature" : "Signed",
    start: "2027-01-01",
    end: "2027-12-31",
    renewal: "2027-09-01",
    kind: i === 3 ? "Fixed" : "Percentage",
    rate: [16, 15, 12, 3200][i],
    currency: ["GBP", "CAD", "AUD", "EUR"][i],
    basis: "First-year tuition",
    milestone: i === 2 ? "Visa approved" : "Confirmed enrolment",
    paymentDays: 30,
    terms:
      "Payment due 30 days after invoice. Withdrawals may trigger an agreed clawback.",
    courseIds: [],
    intakes: [],
    fileId: "",
  }));
  const applications = courses
    .slice(0, 5)
    .map((c, i) => ({
      id: `APP-10${i + 1}`,
      studentId: ["SG-001", "SG-002", "SG-003", "SG-001", "SG-001"][i],
      universityId: c.universityId,
      courseId: c.id,
      course: c.name,
      intake: c.intake,
      status: [
        "Conditional offer",
        "Unconditional offer",
        "Unconditional offer",
        "Under review",
        "Rejected",
      ][i],
      submitted: "2027-05-28",
      deadline: c.deadline,
      deposit: 4000,
      currency: c.currency,
      depositPaid: i === 2,
      accepted: i === 2,
      conditions:
        i === 0
          ? [
              {
                id: "COND-1",
                name: "English result: IELTS 6.5 overall",
                complete: false,
              },
            ]
          : [],
      history: [
        {
          date: "2027-05-28T12:00:00Z",
          status: "Submitted",
          note: "Demo application created.",
        },
      ],
    }));
  applications.push({
    id: "APP-106",
    studentId: "SG-005",
    universityId: "UNI-04",
    courseId: "CRS-06",
    course: "MSc Computer Science",
    intake: "Sep 2027",
    status: "Unconditional offer",
    submitted: "2027-04-03",
    deadline: "2027-07-01",
    deposit: 2000,
    currency: "EUR",
    depositPaid: true,
    accepted: true,
    conditions: [],
    history: [],
  });
  return {
    version: SCHEMA_VERSION,
    students,
    partners,
    courses,
    agreements,
    applications,
    tasks: [
      {
        id: "TASK-1",
        title: "Call Daniel about offer acceptance",
        studentId: "SG-002",
        owner: "Tariq Bello",
        date: "2027-06-12",
        time: "11:30",
        priority: "Normal",
        type: "Follow-up",
        done: false,
      },
      {
        id: "TASK-2",
        title: "Review Amina’s English result",
        studentId: "SG-001",
        owner: "Grace Wanjiku",
        date: "2027-06-18",
        time: "14:00",
        priority: "High",
        type: "Documents",
        done: false,
      },
      {
        id: "TASK-3",
        title: "Priya — visa document check",
        studentId: "SG-003",
        owner: "Grace Wanjiku",
        date: "2027-06-12",
        time: "16:30",
        priority: "Normal",
        type: "Visa",
        done: false,
      },
    ],
    team: [
      {
        id: "USR-1",
        name: "Grace Wanjiku",
        role: "Counsellor",
        salary: 3200,
        currency: "USD",
        payPeriod: "Monthly",
        incentive: "USD 150 per enrolled student",
        active: true,
      },
      {
        id: "USR-2",
        name: "Tariq Bello",
        role: "Counsellor",
        salary: 2800,
        currency: "USD",
        payPeriod: "Monthly",
        incentive: "USD 100 per enrolled student",
        active: true,
      },
      {
        id: "USR-3",
        name: "James Cole",
        role: "Counsellor",
        salary: 2400,
        currency: "USD",
        payPeriod: "Monthly",
        incentive: "",
        active: true,
      },
      {
        id: "USR-4",
        name: "Sima Peter",
        role: "Agency owner",
        salary: 0,
        currency: "USD",
        payPeriod: "Monthly",
        incentive: "Owner managed",
        active: true,
      },
    ],
    visas: [
      {
        id: "VISA-1",
        studentId: "SG-003",
        applicationId: "APP-103",
        status: "Submitted",
        submitted: "2027-06-04",
        appointment: "2027-06-13",
        decision: "",
        flight: "",
        arrival: "",
        enrolment: "",
        notes: "Biometrics pending",
        history: [],
      },
      {
        id: "VISA-2",
        studentId: "SG-005",
        applicationId: "APP-106",
        status: "Approved",
        submitted: "2027-05-03",
        appointment: "2027-05-10",
        decision: "2027-06-05",
        flight: "",
        arrival: "",
        enrolment: "",
        notes: "",
        history: [],
      },
    ],
    documents: [
      {
        id: "DOC-1",
        studentId: "SG-001",
        name: "English test result",
        status: "Required",
        expiry: "",
        feedback: "Required for Westbridge conditional offer",
        fileId: "",
        fileName: "",
      },
    ],
    notes: [],
    activity: [],
    commissions: [],
    settings: {
      agency: "Your agency",
      adminName: "Administrator",
      email: "admin@example.com",
      currency: "USD",
      notifications: true,
      rateDate: "2027-06-12",
      rates: {
        USD: 1,
        GBP: 1.27,
        EUR: 1.08,
        CAD: 0.74,
        AUD: 0.66,
        KES: 0.0077,
      },
    },
  };
}

export function applyAction(
  previous,
  action,
  actor = { role: "Agency owner", name: "Sima Peter" },
) {
  const s = structuredClone(previous),
    p = action.payload || {},
    type = action.type;
  if (
    [
      "partner.save",
      "agreement.save",
      "course.save",
      "team.save",
      "settings.save",
      "restore",
    ].includes(type) &&
    actor.role !== "Agency owner"
  )
    throw Error(
      "Only the agency owner can change these records in the role preview.",
    );
  if (type.startsWith("commission.") && !financeAllowed(actor.role))
    throw Error("Commission changes require an owner or finance role.");
  if (actor.role === "Referral agent" && !["shortlist.toggle"].includes(type))
    throw Error("Referral agent preview is read-only.");
  if (type === "student.save") {
    required(p.name, "Student name");
    validateEmail(p.email);
    required(p.country, "Destination");
    required(p.subject, "Subject");
    number(p.budget, "Budget");
    currency(p.currency);
    enumValue(p.stage, stages, "student stage");
    required(p.counsellor, "Counsellor");
    if (
      s.students.some(
        (x) => x.email.toLowerCase() === p.email.toLowerCase() && x.id !== p.id,
      )
    )
      throw Error("A student with this email already exists.");
    if (
      ["Arrived", "Enrolled"].includes(p.stage) &&
      !s.visas.some(
        (v) =>
          v.studentId === p.id &&
          v.status === "Approved" &&
          v.arrival &&
          (p.stage !== "Enrolled" || v.enrolment),
      )
    )
      throw Error(
        "Confirm visa approval, arrival and enrolment in Visa & Travel first.",
      );
    date(p.deadline, "Next action date");
    write(s.students, {
      ...p,
      shortlist: p.shortlist || [],
      archived: !!p.archived,
    });
    event(s, p.id, "Student profile updated", actor);
  } else if (type === "application.save") {
    ref(s.students, p.studentId, "Student");
    const c = ref(s.courses, p.courseId, "Course");
    enumValue(p.status, statuses, "application status");
    required(p.updateNote, "Application update note");
    if (p.accepted && !p.status.includes("offer"))
      throw Error("Only an offer can be selected/accepted.");
    date(p.deadline, "Deadline");
    date(p.submitted, "Submission date");
    number(p.deposit || 0, "Deposit");
    const old = s.applications.find((x) => x.id === p.id);
    write(s.applications, {
      ...p,
      universityId: c.universityId,
      course: c.name,
      intake: p.intake || c.intake,
      currency: c.currency,
      deposit: Number(p.deposit || 0),
      conditions: p.conditions || [],
      history: [
        {
          date: new Date().toISOString(),
          status: p.status,
          note: p.updateNote,
          actor: actor.name,
        },
        ...(old?.history || []),
      ],
    });
    event(s, p.studentId, `${c.name}: ${p.status}. ${p.updateNote}`, actor);
  } else if (type === "condition.toggle") {
    const a = ref(s.applications, p.applicationId, "Application"),
      c = ref(a.conditions, p.id, "Condition");
    c.complete = !c.complete;
    event(
      s,
      a.studentId,
      `Offer condition ${c.complete ? "completed" : "reopened"}: ${c.name}`,
      actor,
    );
  } else if (type === "partner.save") {
    required(p.name, "University name");
    required(p.country, "Country");
    validateEmail(p.email);
    write(s.partners, p);
    event(s, "", `University partner saved: ${p.name}`, actor);
  } else if (type === "agreement.save") {
    ref(s.partners, p.universityId, "University");
    required(p.name, "Agreement name");
    enumValue(
      p.status,
      ["Draft", "Awaiting signature", "Signed", "Expired", "Not applicable"],
      "contract status",
    );
    date(p.start, "Start date", false);
    date(p.end, "End date", false);
    date(p.renewal, "Renewal date");
    if (p.end < p.start)
      throw Error("Agreement end date must follow its start date.");
    number(p.rate, "Commission rate");
    enumValue(p.kind, ["Percentage", "Fixed"], "commission kind");
    if (p.kind === "Percentage" && Number(p.rate) > 100)
      throw Error("Percentage must be between 0 and 100.");
    currency(p.currency);
    number(p.paymentDays, "Payment days");
    enumValue(
      p.milestone,
      ["Visa approved", "Confirmed enrolment", "Deposit paid"],
      "eligibility milestone",
    );
    for (const id of p.courseIds || [])
      if (ref(s.courses, id, "Course").universityId !== p.universityId)
        throw Error("Agreement course belongs to another university.");
    write(s.agreements, {
      ...p,
      rate: Number(p.rate),
      paymentDays: Number(p.paymentDays),
    });
    event(s, "", "Agreement version saved: " + p.name, actor);
  } else if (type === "course.save") {
    ref(s.partners, p.universityId, "University");
    required(p.name, "Course name");
    required(p.source, "Data source");
    required(p.intake, "Intake");
    number(p.tuition, "Tuition");
    currency(p.currency);
    date(p.deadline, "Course deadline");
    date(p.verified, "Verification date");
    write(s.courses, { ...p, tuition: Number(p.tuition) });
  } else if (type === "shortlist.toggle") {
    const student = ref(s.students, p.studentId, "Student");
    ref(s.courses, p.courseId, "Course");
    student.shortlist = student.shortlist.includes(p.courseId)
      ? student.shortlist.filter((id) => id !== p.courseId)
      : [...student.shortlist, p.courseId];
    event(s, student.id, "Course shortlist updated", actor);
  } else if (type === "note.add") {
    ref(s.students, p.studentId, "Student");
    required(p.text, "Note");
    s.notes.unshift({
      ...p,
      date: new Date().toISOString(),
      actor: actor.name,
    });
    event(s, p.studentId, "Counsellor note added", actor);
  } else if (type === "document.save") {
    ref(s.students, p.studentId, "Student");
    required(p.name, "Document name");
    enumValue(
      p.status,
      [
        "Required",
        "Uploaded",
        "Under review",
        "Verified",
        "Rejected",
        "Expired",
      ],
      "document status",
    );
    date(p.expiry, "Document expiry");
    if (p.status === "Rejected") required(p.feedback, "Rejection feedback");
    write(s.documents, {
      ...p,
      reviewer: actor.name,
      date: new Date().toISOString(),
    });
    event(s, p.studentId, `${p.name}: ${p.status}`, actor);
  } else if (type === "visa.save") {
    ref(s.students, p.studentId, "Student");
    const a = ref(s.applications, p.applicationId, "Selected application");
    if (
      a.studentId !== p.studentId ||
      !a.accepted ||
      !a.status.includes("offer")
    )
      throw Error(
        "Choose an accepted university offer belonging to this student.",
      );
    enumValue(
      p.status,
      ["Preparing", "Submitted", "Approved", "Refused", "Reapplying"],
      "visa status",
    );
    for (const k of [
      "submitted",
      "appointment",
      "decision",
      "arrival",
      "enrolment",
    ])
      date(p[k], k);
    if (["Approved", "Refused"].includes(p.status) && !p.decision)
      throw Error("Record the visa decision date.");
    if (p.decision && p.submitted && p.decision < p.submitted)
      throw Error("Decision date cannot precede submission.");
    if (p.arrival && (p.status !== "Approved" || p.arrival < p.decision))
      throw Error("Arrival requires prior visa approval.");
    if (p.enrolment && (!p.arrival || p.enrolment < p.arrival))
      throw Error("Enrolment requires a prior arrival date.");
    if (p.status === "Refused") required(p.notes, "Refusal explanation");
    const old = s.visas.find((x) => x.id === p.id);
    write(s.visas, {
      ...p,
      history: [
        {
          date: new Date().toISOString(),
          status: p.status,
          text: p.notes,
          submitted: p.submitted,
          decision: p.decision,
        },
        ...(old?.history || []),
      ],
    });
    const st = ref(s.students, p.studentId, "Student");
    st.stage = p.enrolment
      ? "Enrolled"
      : p.arrival
        ? "Arrived"
        : p.status === "Approved"
          ? "Pre-departure"
          : "Visa";
    event(s, st.id, "Visa/travel case updated: " + p.status, actor);
  } else if (type === "task.save") {
    required(p.title, "Task title");
    ref(s.team, p.ownerId, "Team member");
    if (p.studentId) ref(s.students, p.studentId, "Student");
    date(p.date, "Task date", false);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time))
      throw Error("Enter a valid time.");
    write(s.tasks, { ...p, owner: ref(s.team, p.ownerId, "Owner").name });
    event(s, p.studentId, "Task saved: " + p.title, actor);
  } else if (type === "task.toggle") {
    const t = ref(s.tasks, p.id, "Task");
    t.done = !t.done;
    event(
      s,
      t.studentId,
      "Task " + (t.done ? "completed: " : "reopened: ") + t.title,
      actor,
    );
  } else if (type === "team.save") {
    required(p.name, "Team member name");
    enumValue(p.role, roles, "team role");
    number(p.salary, "Salary");
    currency(p.currency);
    if (s.team.some((t) => t.name === p.name && t.id !== p.id))
      throw Error("A team member with this name already exists.");
    const old = s.team.find((t) => t.id === p.id);
    if (old && old.name !== p.name) {
      s.students.forEach((st) => {
        if (st.counsellor === old.name) st.counsellor = p.name;
      });
      s.tasks.forEach((t) => {
        if (t.owner === old.name) t.owner = p.name;
      });
    }
    write(s.team, { ...p, salary: Number(p.salary) });
    event(s, "", "Team member updated: " + p.name, actor);
  } else if (type === "settings.save") {
    required(p.agency, "Agency name");
    validateEmail(p.email);
    currency(p.currency);
    date(p.rateDate, "Rate date", false);
    for (const c of currencies) {
      if (!Number.isFinite(Number(p.rates[c])) || Number(p.rates[c]) <= 0)
        throw Error("Exchange rates must be positive.");
    }
    if (Number(p.rates.USD) !== 1) throw Error("USD base rate must equal 1.");
    s.settings = p;
    event(s, "", "Agency settings updated", actor);
  } else if (type === "commission.create") {
    const a = ref(s.applications, p.applicationId, "Application"),
      g = ref(s.agreements, p.agreementId, "Agreement");
    if (s.commissions.some((c) => c.applicationId === a.id))
      throw Error("This application already has a commission record.");
    if (g.status !== "Signed" || g.universityId !== a.universityId)
      throw Error("Select a signed agreement for this university.");
    const submitted = a.submitted || today();
    if (submitted < g.start || submitted > g.end)
      throw Error("Agreement does not cover the application submission date.");
    if (g.courseIds?.length && !g.courseIds.includes(a.courseId))
      throw Error("Agreement does not cover this course.");
    if (g.intakes?.length && !g.intakes.includes(a.intake))
      throw Error("Agreement does not cover this intake.");
    const c = ref(s.courses, a.courseId, "Course");
    if (g.currency !== c.currency)
      throw Error("Agreement and tuition currencies must match.");
    const amountCents =
      g.kind === "Percentage"
        ? Math.round((cents(c.tuition) * g.rate) / 100)
        : cents(g.rate);
    if (amountCents <= 0)
      throw Error("Commission amount must be greater than zero.");
    s.commissions.push({
      id: p.id,
      applicationId: a.id,
      studentId: a.studentId,
      universityId: a.universityId,
      currency: g.currency,
      amountCents,
      agreementSnapshot: structuredClone(g),
      tuitionSnapshot: c.tuition,
      eligible: false,
      evidence: "",
      invoice: null,
      payments: [],
      adjustments: [],
      created: today(),
    });
    event(s, a.studentId, "Expected commission created", actor);
  } else if (type === "commission.eligible") {
    const c = ref(s.commissions, p.id, "Commission");
    if (c.invoice) throw Error("An invoiced record cannot be made ineligible.");
    required(p.evidence, "Milestone evidence");
    const a = ref(s.applications, c.applicationId, "Application");
    const v = s.visas.find((v) => v.applicationId === a.id);
    if (
      c.agreementSnapshot.milestone === "Visa approved" &&
      v?.status !== "Approved"
    )
      throw Error("Visa approval must be recorded first.");
    if (
      c.agreementSnapshot.milestone === "Confirmed enrolment" &&
      !v?.enrolment
    )
      throw Error("Confirmed enrolment must be recorded first.");
    if (c.agreementSnapshot.milestone === "Deposit paid" && !a.depositPaid)
      throw Error("Record the tuition deposit first.");
    c.eligible = true;
    c.evidence = p.evidence;
    event(s, c.studentId, "Commission milestone verified", actor);
  } else if (type === "commission.invoice") {
    const c = ref(s.commissions, p.id, "Commission");
    if (!c.eligible || c.invoice)
      throw Error("Only eligible, uninvoiced commission can be invoiced.");
    required(p.reference, "Invoice reference");
    if (
      s.commissions.some(
        (x) => x.invoice?.reference.toLowerCase() === p.reference.toLowerCase(),
      )
    )
      throw Error("Invoice reference is already used.");
    date(p.issued, "Invoice date", false);
    date(p.due, "Invoice due date", false);
    if (p.due < p.issued) throw Error("Due date cannot precede invoice date.");
    c.invoice = {
      reference: p.reference,
      issued: p.issued,
      due: p.due,
      originalAmountCents: entitlementTotal(c),
    };
    event(s, c.studentId, "Invoice recorded: " + p.reference, actor);
  } else if (type === "commission.payment") {
    const c = ref(s.commissions, p.id, "Commission");
    if (!c.invoice) throw Error("Record an invoice before recording payment.");
    const amount = cents(p.amount);
    if (amount <= 0 || amount > balance(c))
      throw Error(
        "Payment must be positive and no greater than the outstanding balance.",
      );
    date(p.date, "Payment date", false);
    if (p.date < c.invoice.issued)
      throw Error("Payment date cannot precede invoice issue date.");
    required(p.reference, "Payment reference");
    if (c.payments.some((x) => x.reference === p.reference))
      throw Error("Payment reference already recorded.");
    c.payments.push({
      id: uid("PAY"),
      amountCents: amount,
      date: p.date,
      reference: p.reference,
    });
    event(s, c.studentId, "Commission payment recorded", actor);
  } else if (type === "commission.adjust") {
    const c = ref(s.commissions, p.id, "Commission");
    const amount = cents(p.amount) * (p.direction === "Decrease" ? -1 : 1);
    if (!amount) throw Error("Adjustment must be greater than zero.");
    if (entitlementTotal(c) + amount < paidTotal(c))
      throw Error(
        "Adjustment would reduce entitlement below payments received.",
      );
    required(p.reason, "Adjustment reason");
    c.adjustments.push({
      id: uid("ADJ"),
      amountCents: amount,
      reason: p.reason,
      date: today(),
    });
    event(s, c.studentId, "Commission adjusted: " + p.reason, actor);
  } else throw Error("Unknown operation.");
  return s;
}

export function validateState(s) {
  if (!s || s.version !== SCHEMA_VERSION)
    throw Error("Unsupported CRM backup version.");
  for (const collection of [
    "students",
    "partners",
    "courses",
    "agreements",
    "applications",
    "tasks",
    "team",
    "visas",
    "documents",
    "notes",
    "activity",
    "commissions",
  ]) {
    if (!Array.isArray(s[collection]))
      throw Error(`Missing ${collection} records.`);
    const ids = s[collection].map((x) => x.id);
    if (
      ids.some((id) => typeof id !== "string" || !id) ||
      new Set(ids).size !== ids.length
    )
      throw Error(`Invalid or duplicate IDs in ${collection}.`);
  }
  required(s.settings?.agency, "Agency name");
  validateEmail(s.settings.email);
  currency(s.settings.currency);
  for (const c of currencies) {
    if (
      !Number.isFinite(Number(s.settings.rates[c])) ||
      Number(s.settings.rates[c]) <= 0
    )
      throw Error("Invalid exchange rates.");
  }
  for (const st of s.students) {
    required(st.name, "Student name");
    validateEmail(st.email);
    enumValue(st.stage, stages, "student stage");
    number(st.budget, "Budget");
    currency(st.currency);
    if (!Array.isArray(st.shortlist)) throw Error("Invalid shortlist.");
    for (const id of st.shortlist) ref(s.courses, id, "Shortlist course");
  }
  for (const c of s.courses) {
    ref(s.partners, c.universityId, "Course university");
    number(c.tuition, "Tuition");
    currency(c.currency);
  }
  for (const a of s.applications) {
    ref(s.students, a.studentId, "Application student");
    const c = ref(s.courses, a.courseId, "Application course");
    if (c.universityId !== a.universityId)
      throw Error("Application university mismatch.");
    enumValue(a.status, statuses, "application status");
    if (!Array.isArray(a.history) || !Array.isArray(a.conditions))
      throw Error("Invalid application history.");
  }
  for (const g of s.agreements) {
    ref(s.partners, g.universityId, "Agreement university");
    number(g.rate, "Agreement rate");
    currency(g.currency);
    date(g.start, "Agreement start", false);
    date(g.end, "Agreement end", false);
    if (g.end < g.start) throw Error("Invalid agreement period.");
  }
  for (const v of s.visas) {
    const a = ref(s.applications, v.applicationId, "Visa application");
    if (a.studentId !== v.studentId) throw Error("Visa student mismatch.");
    if (
      v.arrival &&
      (v.status !== "Approved" || !v.decision || v.arrival < v.decision)
    )
      throw Error("Invalid visa arrival.");
    if (v.enrolment && (!v.arrival || v.enrolment < v.arrival))
      throw Error("Invalid enrolment date.");
  }
  for (const d of s.documents) ref(s.students, d.studentId, "Document student");
  for (const n of s.notes) ref(s.students, n.studentId, "Note student");
  for (const c of s.commissions) {
    const a = ref(s.applications, c.applicationId, "Commission application");
    if (a.studentId !== c.studentId || a.universityId !== c.universityId)
      throw Error("Commission links do not match application.");
    currency(c.currency);
    if (
      !Number.isSafeInteger(c.amountCents) ||
      c.amountCents < 0 ||
      !Array.isArray(c.payments) ||
      !Array.isArray(c.adjustments)
    )
      throw Error("Invalid commission amounts.");
    for (const p of c.payments) {
      if (!Number.isSafeInteger(p.amountCents) || p.amountCents <= 0)
        throw Error("Invalid payment amount.");
    }
    for (const x of c.adjustments) {
      if (!Number.isSafeInteger(x.amountCents))
        throw Error("Invalid adjustment.");
    }
    if (balance(c) < 0 || (!c.invoice && c.payments.length))
      throw Error("Invalid commission balance.");
    if (!c.agreementSnapshot) throw Error("Missing agreement snapshot.");
  }
  return s;
}

export function csv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          let cell = String(value ?? "");
          if (/^[=+\-@\t\r]/.test(cell)) cell = "'" + cell;
          return '"' + cell.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}
