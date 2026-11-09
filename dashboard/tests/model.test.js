import test from "node:test";
import assert from "node:assert/strict";
import {
  createSeed,
  applyAction,
  validateState,
  cents,
  balance,
  commissionStatus,
  csv,
  today,
} from "../src/model.js";

const owner = { role: "Agency owner", name: "Test owner" };
const act = (state, type, payload, actor = owner) =>
  validateState(applyAction(state, { type, payload }, actor));
function readyCommission() {
  let s = createSeed();
  s = act(s, "visa.save", {
    ...s.visas[0],
    status: "Approved",
    decision: "2027-06-14",
    arrival: "",
    enrolment: "",
  });
  s = act(s, "commission.create", {
    id: "COM-TEST",
    applicationId: "APP-103",
    agreementId: "AGR-03",
  });
  s = act(s, "commission.eligible", {
    id: "COM-TEST",
    evidence: "Visa grant verified, reference TEST-GRANT",
  });
  return act(s, "commission.invoice", {
    id: "COM-TEST",
    reference: "INV-TEST",
    issued: "2027-06-15",
    due: "2027-07-15",
  });
}

test("seed contains valid linked records and neutral agency branding", () => {
  const s = validateState(createSeed());
  assert.equal(s.settings.agency, "Your agency");
  assert.equal(s.students.length, 5);
  assert.equal(s.applications.length, 6);
});
test("money parses decimal amounts to integer cents", () => {
  assert.equal(cents("10.29"), 1029);
  assert.equal(cents("0.01"), 1);
  assert.equal(cents("10"), 1000);
  for (const v of ["-2", "1.001", "NaN", "Infinity", "1e3", ""])
    assert.throws(() => cents(v));
});
test("student updates do not mutate previous state", () => {
  const s = createSeed();
  const next = act(s, "student.save", {
    ...s.students[0],
    name: "Updated student",
  });
  assert.equal(s.students[0].name, "Amina Hassan");
  assert.equal(next.students[0].name, "Updated student");
  assert.equal(next.activity.length, 1);
});
test("duplicate student email is rejected", () => {
  const s = createSeed();
  assert.throws(
    () => act(s, "student.save", { ...s.students[0], id: "NEW" }),
    /already exists/,
  );
});
test("negative and invalid budgets are rejected", () => {
  const s = createSeed();
  for (const budget of [-1, NaN, Infinity])
    assert.throws(() => act(s, "student.save", { ...s.students[0], budget }));
});
test("application changes remain independent from other applications and student stage", () => {
  let s = createSeed();
  s = act(s, "application.save", {
    ...s.applications[3],
    status: "Conditional offer",
    updateNote: "English test required",
  });
  assert.equal(s.students[0].stage, "Applying");
  assert.equal(s.applications[4].status, "Rejected");
  assert.equal(s.applications[3].history[0].note, "English test required");
});
test("only offers can be selected for visa processing", () => {
  const s = createSeed();
  assert.throws(
    () =>
      act(s, "application.save", {
        ...s.applications[3],
        accepted: true,
        updateNote: "Testing",
      }),
    /Only an offer/,
  );
});
test("unknown courses cannot be linked to applications", () => {
  const s = createSeed();
  assert.throws(
    () =>
      act(s, "application.save", {
        ...s.applications[0],
        courseId: "missing",
        updateNote: "Testing",
      }),
    /Course does not exist/,
  );
});
test("application status changes require a note", () => {
  const s = createSeed();
  assert.throws(
    () => act(s, "application.save", { ...s.applications[0], updateNote: "" }),
    /note is required/,
  );
});
test("offer conditions toggle individually and log activity", () => {
  let s = createSeed();
  s = act(s, "condition.toggle", { applicationId: "APP-101", id: "COND-1" });
  assert.equal(s.applications[0].conditions[0].complete, true);
  assert.match(s.activity[0].text, /completed/);
});
test("course shortlists toggle without duplicates", () => {
  let s = createSeed();
  s = act(s, "shortlist.toggle", { studentId: "SG-001", courseId: "CRS-02" });
  assert.equal(s.students[0].shortlist.length, 2);
  s = act(s, "shortlist.toggle", { studentId: "SG-001", courseId: "CRS-02" });
  assert.deepEqual(s.students[0].shortlist, ["CRS-01"]);
});
test("visa requires an accepted offer belonging to the same student", () => {
  const s = createSeed();
  assert.throws(
    () => act(s, "visa.save", { ...s.visas[0], applicationId: "APP-101" }),
    /accepted university offer/,
  );
});
test("visa approval requires a decision date", () => {
  const s = createSeed();
  assert.throws(
    () =>
      act(s, "visa.save", { ...s.visas[0], status: "Approved", decision: "" }),
    /decision date/,
  );
});
test("arrival and enrolment require approval in chronological order", () => {
  const s = createSeed();
  assert.throws(
    () => act(s, "visa.save", { ...s.visas[0], arrival: "2027-07-01" }),
    /approval/,
  );
  assert.throws(
    () =>
      act(s, "visa.save", {
        ...s.visas[0],
        status: "Approved",
        decision: "2027-06-14",
        enrolment: "2027-08-01",
      }),
    /prior arrival/,
  );
  assert.throws(
    () =>
      act(s, "visa.save", {
        ...s.visas[0],
        status: "Approved",
        decision: "2027-06-14",
        arrival: "2027-06-13",
      }),
    /approval/,
  );
});
test("complete visa-to-enrolment journey updates student stages and preserves refusal history", () => {
  let s = createSeed();
  s = act(s, "visa.save", {
    ...s.visas[0],
    status: "Refused",
    decision: "2027-06-14",
    notes: "Test evidence missing",
  });
  s = act(s, "visa.save", {
    ...s.visas[0],
    status: "Reapplying",
    submitted: "2027-06-20",
    decision: "",
    notes: "Reapplication",
  });
  s = act(s, "visa.save", {
    ...s.visas[0],
    status: "Approved",
    decision: "2027-07-01",
  });
  assert.equal(s.students[2].stage, "Pre-departure");
  s = act(s, "visa.save", { ...s.visas[0], arrival: "2027-08-01" });
  assert.equal(s.students[2].stage, "Arrived");
  s = act(s, "visa.save", { ...s.visas[0], enrolment: "2027-08-05" });
  assert.equal(s.students[2].stage, "Enrolled");
  assert.equal(s.visas[0].history.at(-1).status, "Refused");
});
test("direct stage edits cannot bypass visa arrival validation", () => {
  const s = createSeed();
  assert.throws(
    () => act(s, "student.save", { ...s.students[0], stage: "Enrolled" }),
    /Visa & Travel/,
  );
});
test("document rejection requires review feedback", () => {
  const s = createSeed();
  assert.throws(
    () =>
      act(s, "document.save", {
        ...s.documents[0],
        status: "Rejected",
        feedback: "",
      }),
    /feedback/,
  );
});
test("calendar event creation and completion are persisted by the same model", () => {
  let s = createSeed();
  s = act(s, "task.save", {
    id: "TASK-NEW",
    title: "Counselling meeting",
    studentId: "SG-001",
    ownerId: "USR-1",
    date: "2027-06-22",
    time: "10:30",
    priority: "High",
    type: "Appointment",
    done: false,
  });
  s = act(s, "task.toggle", { id: "TASK-NEW" });
  assert.equal(s.tasks.at(-1).done, true);
  assert.equal(s.tasks.at(-1).owner, "Grace Wanjiku");
  assert.equal(s.tasks.at(-1).type, "Appointment");
});
test("invalid calendar dates and times are rejected", () => {
  const s = createSeed(),
    task = {
      id: "NEW",
      title: "Meeting",
      ownerId: "USR-1",
      date: "2027-06-31",
      time: "10:00",
    };
  assert.throws(() => act(s, "task.save", task));
  assert.throws(() =>
    act(s, "task.save", { ...task, date: "2027-06-30", time: "25:00" }),
  );
});
test("commission calculation uses signed terms and integer cents", () => {
  let s = createSeed();
  s = act(s, "commission.create", {
    id: "COM-TEST",
    applicationId: "APP-101",
    agreementId: "AGR-01",
  });
  assert.equal(s.commissions[0].amountCents, 312000);
  assert.equal(s.commissions[0].currency, "GBP");
});
test("unsigned, mismatched and out-of-period agreements are rejected", () => {
  const s = createSeed();
  assert.throws(
    () =>
      act(s, "commission.create", {
        id: "X",
        applicationId: "APP-101",
        agreementId: "AGR-04",
      }),
    /signed agreement/,
  );
  s.agreements[0].end = "2027-03-01";
  assert.throws(
    () =>
      act(s, "commission.create", {
        id: "X",
        applicationId: "APP-101",
        agreementId: "AGR-01",
      }),
    /submission date/,
  );
});
test("course and intake agreement restrictions are enforced", () => {
  const s = createSeed();
  s.agreements[0].courseIds = ["CRS-02"];
  assert.throws(
    () =>
      act(s, "commission.create", {
        id: "X",
        applicationId: "APP-101",
        agreementId: "AGR-01",
      }),
    /this course/,
  );
  s.agreements[0].courseIds = [];
  s.agreements[0].intakes = ["Feb 2028"];
  assert.throws(
    () =>
      act(s, "commission.create", {
        id: "X",
        applicationId: "APP-101",
        agreementId: "AGR-01",
      }),
    /this intake/,
  );
});
test("existing entitlements preserve terms after partner agreement editing", () => {
  let s = createSeed();
  s = act(s, "commission.create", {
    id: "COM-TEST",
    applicationId: "APP-101",
    agreementId: "AGR-01",
  });
  s = act(s, "agreement.save", { ...s.agreements[0], rate: 30 });
  assert.equal(s.commissions[0].agreementSnapshot.rate, 16);
  assert.equal(s.commissions[0].amountCents, 312000);
});
test("duplicate entitlements are rejected", () => {
  let s = createSeed();
  s = act(s, "commission.create", {
    id: "COM-TEST",
    applicationId: "APP-101",
    agreementId: "AGR-01",
  });
  assert.throws(
    () =>
      act(s, "commission.create", {
        id: "SECOND",
        applicationId: "APP-101",
        agreementId: "AGR-01",
      }),
    /already has/,
  );
});
test("commission eligibility cannot precede the agreement milestone", () => {
  let s = createSeed();
  s = act(s, "commission.create", {
    id: "COM-TEST",
    applicationId: "APP-103",
    agreementId: "AGR-03",
  });
  assert.throws(
    () => act(s, "commission.eligible", { id: "COM-TEST", evidence: "Test" }),
    /Visa approval/,
  );
  assert.throws(
    () =>
      act(s, "commission.invoice", {
        id: "COM-TEST",
        reference: "X",
        issued: "2027-06-01",
        due: "2027-07-01",
      }),
    /eligible/,
  );
});
test("partial and final payments reconcile exactly", () => {
  let s = readyCommission();
  s = act(s, "commission.payment", {
    id: "COM-TEST",
    amount: "1000.29",
    date: "2027-06-16",
    reference: "PART-1",
  });
  assert.equal(balance(s.commissions[0]), 331971);
  assert.equal(commissionStatus(s.commissions[0]), "Partial payment");
  s = act(s, "commission.payment", {
    id: "COM-TEST",
    amount: "3319.71",
    date: "2027-06-17",
    reference: "FINAL",
  });
  assert.equal(balance(s.commissions[0]), 0);
  assert.equal(commissionStatus(s.commissions[0]), "Paid");
});
test("overpayment, zero payments and duplicate references are rejected", () => {
  let s = readyCommission();
  assert.throws(
    () =>
      act(s, "commission.payment", {
        id: "COM-TEST",
        amount: "5000",
        date: "2027-06-16",
        reference: "X",
      }),
    /outstanding/,
  );
  assert.throws(
    () =>
      act(s, "commission.payment", {
        id: "COM-TEST",
        amount: "0",
        date: "2027-06-16",
        reference: "X",
      }),
    /positive/,
  );
  s = act(s, "commission.payment", {
    id: "COM-TEST",
    amount: "100",
    date: "2027-06-16",
    reference: "X",
  });
  assert.throws(
    () =>
      act(s, "commission.payment", {
        id: "COM-TEST",
        amount: "100",
        date: "2027-06-16",
        reference: "X",
      }),
    /already recorded/,
  );
});
test("payments cannot precede invoice and adjustments cannot erase received money", () => {
  let s = readyCommission();
  assert.throws(
    () =>
      act(s, "commission.payment", {
        id: "COM-TEST",
        amount: "100",
        date: "2027-06-14",
        reference: "EARLY",
      }),
    /precede/,
  );
  s = act(s, "commission.payment", {
    id: "COM-TEST",
    amount: "1000",
    date: "2027-06-16",
    reference: "FIRST",
  });
  assert.throws(
    () =>
      act(s, "commission.adjust", {
        id: "COM-TEST",
        amount: "4000",
        direction: "Decrease",
        reason: "Withdrawal",
      }),
    /below payments/,
  );
  s = act(s, "commission.adjust", {
    id: "COM-TEST",
    amount: "200",
    direction: "Decrease",
    reason: "Agreed fee correction",
  });
  assert.equal(balance(s.commissions[0]), 312000);
});
test("preview permissions reject finance and owner-only changes", () => {
  const s = createSeed();
  assert.throws(
    () => act(s, "team.save", s.team[0], { role: "Counsellor" }),
    /Only the agency owner/,
  );
  assert.throws(
    () => act(s, "commission.create", {}, { role: "Counsellor" }),
    /finance role/,
  );
  assert.throws(
    () => act(s, "student.save", s.students[0], { role: "Referral agent" }),
    /read-only/,
  );
});
test("renaming a team member preserves assignment links", () => {
  let s = createSeed();
  s = act(s, "team.save", { ...s.team[0], name: "New name" });
  assert.equal(s.students[0].counsellor, "New name");
  assert.equal(s.tasks[1].owner, "New name");
});
test("agency branding and administrator names are configurable", () => {
  let s = createSeed();
  s = act(s, "settings.save", {
    ...s.settings,
    agency: "Horizon Education",
    adminName: "Alex",
  });
  assert.equal(s.settings.agency, "Horizon Education");
  assert.equal(s.settings.adminName, "Alex");
});
test("backup validation rejects duplicate identifiers, broken links and overpaid balances", () => {
  let s = createSeed();
  s.students.push(s.students[0]);
  assert.throws(() => validateState(s), /duplicate/);
  s = createSeed();
  s.applications[0].studentId = "MISSING";
  assert.throws(() => validateState(s), /does not exist/);
  s = readyCommission();
  s.commissions[0].payments.push({ amountCents: 999999 });
  assert.throws(() => validateState(s), /balance/);
});
test("JSON roundtrip preserves a valid completed workflow", () => {
  let s = readyCommission();
  s = act(s, "commission.payment", {
    id: "COM-TEST",
    amount: "200",
    date: "2027-06-16",
    reference: "FIRST",
  });
  const restored = validateState(JSON.parse(JSON.stringify(s)));
  assert.equal(balance(restored.commissions[0]), 412000);
});
test("CSV quotes fields and neutralizes spreadsheet formulas", () => {
  assert.equal(
    csv([['=HYPERLINK("bad")', "a,b", "safe"]]),
    '"\'=HYPERLINK(""bad"")","a,b","safe"',
  );
});
