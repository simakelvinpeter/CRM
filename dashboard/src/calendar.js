// JavaScript months start at zero: January is 0, June is 5.
export function getCalendarDays(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  // Convert Sunday-first numbering into a Monday-first calendar.
  const emptyCells = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array(emptyCells).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}
