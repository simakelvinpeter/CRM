import { useState } from "react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import {
  balance,
  paidTotal,
  entitlementTotal,
  commissionStatus,
  csv,
} from "../model.js";
import { Badge, Panel, money, formatDate } from "./Shared.jsx";
import { Heading, SearchBox, Empty } from "./Forms.jsx";
import { downloadBlob } from "../files.js";

export default function FinancePage() {
  const { data, open } = useWorkspace(),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("All"),
    [selected, setSelected] = useState(null);
  const student = (id) =>
      data.students.find((s) => s.id === id)?.name || "Unknown student",
    university = (id) =>
      data.partners.find((p) => p.id === id)?.name || "Unknown university";
  const conversion = (c) =>
    Number(data.settings.rates[c.currency]) /
    Number(data.settings.rates[data.settings.currency]);
  const total = (fn) =>
    data.commissions.reduce((sum, c) => sum + (fn(c) / 100) * conversion(c), 0);
  const records = data.commissions.filter(
    (c) =>
      (
        student(c.studentId) +
        " " +
        university(c.universityId) +
        " " +
        (c.invoice?.reference || "")
      )
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "All" || commissionStatus(c) === status),
  );
  const selectedRecord = data.commissions.find((c) => c.id === selected);
  function exportCsv() {
    downloadBlob(
      new Blob(
        [
          csv([
            [
              "Student",
              "University",
              "Currency",
              "Expected",
              "Invoiced reference",
              "Payments",
              "Outstanding",
            ],
            ...records.map((c) => [
              student(c.studentId),
              university(c.universityId),
              c.currency,
              entitlementTotal(c) / 100,
              c.invoice?.reference || "",
              paidTotal(c) / 100,
              balance(c) / 100,
            ]),
          ]),
        ],
        { type: "text/csv;charset=utf-8" },
      ),
      "commissions.csv",
    );
  }
  if (selectedRecord) {
    const c = selectedRecord,
      g = c.agreementSnapshot;
    return (
      <>
        <button className="back-link" onClick={() => setSelected(null)}>
          ← Commissions
        </button>
        <Heading
          title={student(c.studentId)}
          text={university(c.universityId) + " · " + c.id}
        >
          <button className="button" onClick={() => open("adjustment", c.id)}>
            Adjustment / clawback
          </button>
          {!c.eligible ? (
            <button
              className="button primary"
              onClick={() => open("eligible", c.id)}
            >
              Verify eligibility
            </button>
          ) : !c.invoice ? (
            <button
              className="button primary"
              onClick={() => open("invoice", c.id)}
            >
              Record invoice
            </button>
          ) : balance(c) > 0 ? (
            <button
              className="button primary"
              onClick={() => open("payment", c.id)}
            >
              Record payment
            </button>
          ) : (
            <Badge>Paid</Badge>
          )}
        </Heading>
        <div className="finance-summary">
          <div className="metric-card">
            <div>Entitlement</div>
            <strong>{money(entitlementTotal(c) / 100, c.currency)}</strong>
          </div>
          <div className="metric-card">
            <div>Received</div>
            <strong>{money(paidTotal(c) / 100, c.currency)}</strong>
          </div>
          <div className="metric-card">
            <div>Outstanding</div>
            <strong>{money(balance(c) / 100, c.currency)}</strong>
          </div>
        </div>
        <div className="two-columns">
          <Panel
            title="Preserved agreement snapshot"
            subtitle="Editing the current partner agreement does not change these terms"
          >
            <dl className="detail-grid">
              {[
                ["Version", g.name],
                ["Kind", g.kind],
                [
                  "Rate / fixed amount",
                  g.rate + (g.kind === "Percentage" ? "%" : " " + g.currency),
                ],
                ["Tuition at placement", money(c.tuitionSnapshot, c.currency)],
                ["Eligibility milestone", g.milestone],
                [
                  "Original expected amount",
                  money(c.amountCents / 100, c.currency),
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="body-copy">{g.terms}</p>
          </Panel>
          <Panel title="Invoice & eligibility">
            <dl className="detail-grid">
              {[
                ["Status", commissionStatus(c)],
                ["Milestone evidence", c.evidence || "Not verified"],
                ["Invoice", c.invoice?.reference || "Not invoiced"],
                ["Issued", formatDate(c.invoice?.issued)],
                ["Due", formatDate(c.invoice?.due)],
                [
                  "Original invoice amount",
                  c.invoice
                    ? money(c.invoice.originalAmountCents / 100, c.currency)
                    : "—",
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
        <Panel
          title="Payment history"
          subtitle="Each payment remains in the entitlement’s original currency"
        >
          <div className="simple-list">
            {c.payments.map((p) => (
              <div className="list-row" key={p.id}>
                <strong className="grow">
                  {money(p.amountCents / 100, c.currency)}
                </strong>
                <span>
                  {formatDate(p.date)} · {p.reference}
                </span>
              </div>
            ))}
            {!c.payments.length && <Empty text="No payments received yet." />}
          </div>
        </Panel>
        <div className="section-gap">
          <Panel title="Adjustment journal">
            <div className="simple-list">
              {c.adjustments.map((a) => (
                <div className="list-row" key={a.id}>
                  <strong>{money(a.amountCents / 100, c.currency)}</strong>
                  <div>
                    <p>{a.reason}</p>
                    <small>{formatDate(a.date)}</small>
                  </div>
                </div>
              ))}
              {!c.adjustments.length && <Empty text="No adjustments." />}
            </div>
          </Panel>
        </div>
      </>
    );
  }
  return (
    <>
      <Heading
        title="Commissions"
        text="From expected earnings to the last payment received"
      >
        <button className="button" onClick={exportCsv}>
          Export CSV
        </button>
        <button
          className="button primary"
          onClick={() => open("commissionCreate")}
        >
          + Create entitlement
        </button>
      </Heading>
      <div className="finance-summary four">
        {[
          ["Expected", total((c) => entitlementTotal(c))],
          [
            "Eligible to invoice",
            total((c) => (c.eligible && !c.invoice ? balance(c) : 0)),
          ],
          ["Invoiced & unpaid", total((c) => (c.invoice ? balance(c) : 0))],
          ["Received", total((c) => paidTotal(c))],
        ].map(([title, value]) => (
          <div className="metric-card" key={title}>
            <div>{title}</div>
            <strong>{money(value, data.settings.currency)}</strong>
          </div>
        ))}
      </div>
      <p className="helper">
        Reporting currency {data.settings.currency} · manual indicative rates
        dated {formatDate(data.settings.rateDate)}. Totals overlap across the
        lifecycle and are not additive.
      </p>
      <Panel
        title="Commission ledger"
        action={
          <div className="heading-actions">
            <SearchBox
              label="Search commissions"
              value={query}
              onChange={setQuery}
            />
            <select
              aria-label="Commission status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {[
                "All",
                "Expected",
                "Eligible",
                "Invoiced",
                "Overdue",
                "Partial payment",
                "Paid",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student / university</th>
                <th>Currency</th>
                <th>Entitlement</th>
                <th>Invoice</th>
                <th>Status</th>
                <th>Outstanding</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {records.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{student(c.studentId)}</strong>
                    <small>{university(c.universityId)}</small>
                  </td>
                  <td>{c.currency}</td>
                  <td>{money(entitlementTotal(c) / 100, c.currency)}</td>
                  <td>{c.invoice?.reference || "Not invoiced"}</td>
                  <td>
                    <Badge>{commissionStatus(c)}</Badge>
                  </td>
                  <td>{money(balance(c) / 100, c.currency)}</td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setSelected(c.id)}
                    >
                      Open commission
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <Empty text="Create your first expected commission from an application and a signed agreement." />
        )}
      </Panel>
    </>
  );
}
