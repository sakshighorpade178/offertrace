import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  SearchCheck,
  MailCheck,
  Link2,
  LockKeyhole,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  UserRound,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("offertrace_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  function handleLogout() {
    sessionStorage.removeItem("offertrace_access_token");
    sessionStorage.removeItem("offertrace_user");

    setUser(null);
    navigate("/login");
  }

  return (
    <main className="ot-home">
      <section className="ot-hero">
        <div className="ot-hero-content">
          <div className="ot-trust-badge">
            <ShieldCheck size={16} />
            <span>Your opportunity safety companion</span>
          </div>

          <h1>
            Your next opportunity
            <br />
            should be <span>real.</span>
          </h1>

          <p className="ot-hero-description">
            Check internship offers, recruitment emails and job links
            for suspicious signals before sharing your information
            or trusting an opportunity.
          </p>

          <div className="ot-hero-actions">
            <button
              type="button"
              className="ot-button ot-button-primary"
              onClick={() =>
                navigate(user ? "/dashboard" : "/register")
              }
            >
              {user ? "Open Dashboard" : "Get Started"}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="ot-button ot-button-secondary"
              onClick={() =>
                navigate(user ? "/dashboard" : "/login")
              }
            >
              {user ? "My Workspace" : "Sign In"}
            </button>
          </div>

          <div className="ot-hero-note">
            <LockKeyhole size={15} />
            <span>Designed to help you make informed decisions.</span>
          </div>
        </div>

        <div className="ot-hero-visual">
          <div className="ot-visual-glow" />

          <div className="ot-preview-card">
            <div className="ot-preview-top">
              <div className="ot-preview-icon">
                <ShieldCheck size={25} />
              </div>

              <div>
                <p className="ot-preview-label">OFFERTRACE</p>
                <h3>Opportunity Check</h3>
              </div>

              <span className="ot-live-dot" />
            </div>

            <div className="ot-preview-divider" />

            <div className="ot-preview-item">
              <div className="ot-preview-item-icon">
                <MailCheck size={19} />
              </div>

              <div className="ot-preview-item-text">
                <strong>Email signals</strong>
                <span>Review sender and message content</span>
              </div>

              <CheckCircle2
                size={19}
                className="ot-preview-check"
              />
            </div>

            <div className="ot-preview-item">
              <div className="ot-preview-item-icon">
                <Link2 size={19} />
              </div>

              <div className="ot-preview-item-text">
                <strong>Opportunity URL</strong>
                <span>Inspect basic URL warning signs</span>
              </div>

              <SearchCheck
                size={19}
                className="ot-preview-check"
              />
            </div>

            <div className="ot-preview-item">
              <div className="ot-preview-item-icon">
                <FileSearch size={19} />
              </div>

              <div className="ot-preview-item-text">
                <strong>Evidence-based report</strong>
                <span>Understand detected warning signals</span>
              </div>

              <ShieldCheck
                size={19}
                className="ot-preview-check"
              />
            </div>

            <div className="ot-preview-footer">
              <ShieldCheck size={16} />
              <span>Verify first. Decide with confidence.</span>
            </div>
          </div>

          <div className="ot-floating-card ot-floating-top">
            <ShieldCheck size={19} />
            <span>Stay informed</span>
          </div>

          <div className="ot-floating-card ot-floating-bottom">
            <AlertTriangle size={19} />
            <span>Spot warning signs</span>
          </div>
        </div>
      </section>

      <section className="ot-features">
        <div className="ot-section-heading">
          <p className="ot-eyebrow">BUILT FOR SMARTER DECISIONS</p>

          <h2>
            A little verification.
            <br />
            A lot more confidence.
          </h2>

          <p>
            Understand potential risks in an opportunity before
            deciding what to do next.
          </p>
        </div>

        <div className="ot-feature-grid">
          <article className="ot-feature-card">
            <div className="ot-feature-icon ot-icon-blue">
              <MailCheck size={23} />
            </div>

            <h3>Email Analysis</h3>

            <p>
              Check message content for payment requests, unusual
              urgency and potentially unrealistic promises.
            </p>
          </article>

          <article className="ot-feature-card">
            <div className="ot-feature-icon ot-icon-purple">
              <Link2 size={23} />
            </div>

            <h3>URL Warning Checks</h3>

            <p>
              Inspect basic URL characteristics and understand
              why a link may need closer attention.
            </p>
          </article>

          <article className="ot-feature-card">
            <div className="ot-feature-icon ot-icon-green">
              <FileSearch size={23} />
            </div>

            <h3>Clear Evidence</h3>

            <p>
              Review detected signals and recommendations instead
              of relying on an unexplained score alone.
            </p>
          </article>
        </div>
      </section>

      <section className="ot-bottom-cta">
        <div className="ot-bottom-cta-icon">
          <ShieldCheck size={28} />
        </div>

        <div className="ot-bottom-cta-content">
          <h2>Found an opportunity worth checking?</h2>
          <p>
            Start with the information you have and review the
            warning signals before making a decision.
          </p>
        </div>

        <button
          type="button"
          className="ot-button ot-button-light"
          onClick={() =>
            navigate(user ? "/dashboard" : "/register")
          }
        >
          Check an Opportunity
          <ArrowRight size={18} />
        </button>
      </section>

      <section className="ot-account-strip">
        <div className="ot-account-strip-icon">
          <UserRound size={20} />
        </div>

        <div className="ot-account-strip-content">
          {user ? (
            <>
              <strong>Welcome back, {user.full_name}!</strong>
              <span>{user.email}</span>
            </>
          ) : (
            <>
              <strong>Make OfferTrace your safety companion.</strong>
              <span>Create an account to access your workspace.</span>
            </>
          )}
        </div>

        {user ? (
          <button
            type="button"
            className="ot-text-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link to="/register" className="ot-text-button">
            Create account <ArrowRight size={15} />
          </Link>
        )}
      </section>
    </main>
  );
}

export default Home;