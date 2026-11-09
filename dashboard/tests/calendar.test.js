import test from "node:test";
import assert from "node:assert/strict";
import { getCalendarDays } from "../src/calendar.js";

test("June 2027 starts on Tuesday and ends at day 30", () => {
  const cells = getCalendarDays(2027, 5);
  assert.equal(cells[0], null);
  assert.equal(cells[1], 1);
  assert.equal(cells.at(-1), 30);
  assert.equal(cells.filter(Boolean).length, 30);
  assert.equal(cells.includes(31), false);
});

test("February follows leap-year rules", () => {
  assert.equal(getCalendarDays(2028, 1).filter(Boolean).length, 29);
  assert.equal(getCalendarDays(2027, 1).filter(Boolean).length, 28);
});

test("a Sunday start places six blanks before day one", () => {
  assert.deepEqual(getCalendarDays(2026, 1).slice(0, 7), [
    null,
    null,
    null,
    null,
    null,
    null,
    1,
  ]);
});
