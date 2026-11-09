import { useState } from "react";
import {
  Globe2,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { demoAccounts, DEMO_PASSWORD, signInDemo } from "../demoAuth.js";
import "../login.css";

export default function LoginPage({ onSignIn }) {
  // React remembers what you type without saving your password to browser storage.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);
  function submit(event) {
    event.preventDefault();
    setError("");
    try {
      // The account determines the role. There is no self-selected owner role.
      onSignIn(signInDemo(email, password));
    } catch (problem) {
      setError(problem.message);
    }
  }
  return (
    <main className="login-page">
      <div className="login-orbit" aria-hidden="true" />
      <div className="login-layout">
        <section className="login-story" aria-labelledby="login-brand">
          <div className="login-brand">
            <Globe2 size={32} />
            <span id="login-brand">
              Agency CRM<small>GLOBAL EDUCATION. CONNECTED.</small>
            </span>
          </div>
          <span className="login-eyebrow">A WORLD OF OPPORTUNITY</span>
          <h1>
            Every ambition.
            <br />A clearer <em>journey.</em>
          </h1>
          <p>
            Bring your students, university partnerships and team together. From
            the first conversation to a new beginning abroad.
          </p>
          <div className="login-journey">
            <span>Discover</span>
            <i />
            <span>Apply</span>
            <i />
            <span>Arrive</span>
          </div>
          <div className="login-story-footer">
            <ShieldCheck size={18} /> One workspace for your agency’s next
            chapter.
          </div>
        </section>
        <section className="login-card" aria-labelledby="sign-in-title">
          <span className="login-card-icon">
            <LockKeyhole size={23} />
          </span>
          <div className="login-eyebrow">YOUR AGENCY WORKSPACE</div>
          <h2 id="sign-in-title">Welcome back</h2>
          <p className="login-intro">
            Sign in to continue your students’ journeys.
          </p>
          <form onSubmit={submit}>
            <label htmlFor="login-email">Email address</label>
            <div className="login-field">
              <Mail size={18} />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@agency.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <label htmlFor="login-password">Password</label>
            <div className="login-field">
              <LockKeyhole size={18} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={error ? "login-error" : undefined}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="login-access-note">
              <ShieldCheck size={14} /> Your account determines your workspace
              role.
            </div>
            {error && (
              <p id="login-error" className="login-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" type="submit">
              Sign in to workspace <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-demo-note">
            <strong>Local demo</strong>
            <span>
              Use fictional data. Accounts share this browser’s workspace; this
              is not secure agency authentication.
            </span>
          </div>
          <button
            type="button"
            className="login-demo-toggle"
            aria-expanded={showAccounts}
            onClick={() => setShowAccounts(!showAccounts)}
          >
            {showAccounts
              ? "Hide demo accounts"
              : "Explore with a demo account"}
            <ArrowRight size={14} />
          </button>
          {showAccounts && (
            <div className="login-demo-accounts">
              <p>Choose an account to fill the form.</p>
              {demoAccounts.map((account) => (
                <button
                  type="button"
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(DEMO_PASSWORD);
                    setError("");
                  }}
                >
                  <strong>{account.role}</strong>
                  <span>{account.email}</span>
                </button>
              ))}
              <p>
                Demo password: <code>{DEMO_PASSWORD}</code>
              </p>
            </div>
          )}
          <p className="login-invite">
            Real access will be invitation-based through your agency
            administrator.
          </p>
        </section>
      </div>
      <footer className="login-footer">
        <span>AGENCY CRM</span>
        <span>Built around your students’ future.</span>
      </footer>
    </main>
  );
}
