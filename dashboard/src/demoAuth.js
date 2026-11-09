// Demo credentials are public fixtures, never real agency passwords.
export const DEMO_PASSWORD = "ExploreCRM!2026";
export const demoAccounts = [
  { email: "owner@demo.agency", role: "Agency owner", name: "Administrator" },
  {
    email: "finance@demo.agency",
    role: "Finance manager",
    name: "Finance demo",
  },
  {
    email: "counsellor@demo.agency",
    role: "Counsellor",
    name: "Grace Wanjiku",
  },
  {
    email: "referral@demo.agency",
    role: "Referral agent",
    name: "Tariq Bello",
  },
];
export function signInDemo(email, password) {
  const account = demoAccounts.find(
    (a) => a.email === email.trim().toLowerCase(),
  );
  if (!account || password !== DEMO_PASSWORD)
    throw Error("Email or password is incorrect. Use a demo account below.");
  return { ...account };
}
