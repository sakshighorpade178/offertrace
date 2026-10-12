import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  SearchCheck,
  FileSearch,
  History,
  UserRound,
  Mail,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  LockKeyhole,
} from "lucide-react";
import { getCurrentUser } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const token = sessionStorage.getItem("offertrace_access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message ||
              "Unable to verify your session. Please sign in again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("offertrace_access_token");
    sessionStorage.removeItem("offertrace_user");
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="ot-dashboard-state">
        <div className="ot-state-icon">
          <ShieldCheck size={30} />
        </div>

        <h2>Securing your workspace</h2>

        <p>Verifying your OfferTrace account...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ot-dashboard-state">
        <div className="ot-state-icon ot-state-error">
          <AlertTriangle size={30} />
        </div>

        <h1>Unable to load Dashboard</h1>

        <p>{error}</p>

        <div className="ot-state-actions">
          <button
            type="button"
            className="ot-button ot-button-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

          <button
            type="button"
            className="ot-button ot-button-secondary"
            onClick={handleLogout}
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="ot-dashboard">
      <section className="ot-dashboard-welcome">
        <div>
          <p className="ot-eyebrow">YOUR WORKSPACE</p>

          <h1>
            Welcome back, <span>{user.full_name}.</span>
          </h1>

          <p className="ot-dashboard-subtitle">
            Make your next career move with greater awareness.
            Review opportunities before you trust them.
          </p>
        </div>

        <div className="ot-dashboard-welcome-icon">
          <ShieldCheck size={43} strokeWidth={1.5} />
        </div>
      </section>

      <section className="ot-dashboard-notice">
        <div className="ot-notice-icon">
          <CheckCircle2 size={21} />
        </div>

        <div>
          <strong>Your account is connected</strong>

          <p>
            Your workspace is ready. Start a verification to
            inspect an internship or job opportunity.
          </p>
        </div>

        <span className="ot-status-badge">
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </section>

      <section className="ot-dashboard-main-grid">
        <article className="ot-start-card">
          <div className="ot-start-card-top">
            <div className="ot-start-icon">
              <SearchCheck size={27} />
            </div>

            <span className="ot-card-label">GET STARTED</span>
          </div>

          <h2>Verify an opportunity</h2>

          <p>
            Have a recruitment email or application link?
            Analyze the available information for potential
            warning signs and review the evidence.
          </p>

          <div className="ot-start-options">
            <div>
              <Mail size={17} />
              <span>Recruitment emails</span>
            </div>

            <div>
              <SearchCheck size={17} />
              <span>Opportunity URLs</span>
            </div>

            <div>
              <FileSearch size={17} />
              <span>Evidence and risk report</span>
            </div>
          </div>

          <button
            type="button"
            className="ot-button ot-button-primary ot-start-button"
            onClick={() => navigate("/verify")}
          >
            Start Verification
            <ArrowRight size={18} />
          </button>

          <div className="ot-privacy-note">
            <LockKeyhole size={15} />
            <span>Available checks are preliminary, not a guarantee.</span>
          </div>
        </article>

        <article className="ot-dashboard-side-card">
          <div className="ot-side-card-icon">
            <History size={23} />
          </div>

          <p className="ot-eyebrow">YOUR ACTIVITY</p>

          <h2>Verification History</h2>

          <p>
            Find your previous reports and revisit the warning
            signals identified during each check.
          </p>

          <div className="ot-history-empty">
            <FileSearch size={21} />

            <span>
              Report history will appear here when the history
              view is connected.
            </span>
          </div>

          <button
            type="button"
            className="ot-outline-button"
            onClick={() =>
              window.alert(
                "Verification history is the next feature to connect."
              )
            }
          >
            History Coming Soon
          </button>
        </article>
      </section>

      <section className="ot-account-card">
        <div className="ot-account-card-heading">
          <div className="ot-account-heading-icon">
            <UserRound size={22} />
          </div>

          <div>
            <h2>Account Details</h2>

            <p>Your OfferTrace account information</p>
          </div>
        </div>

        <div className="ot-account-details">
          <div className="ot-account-field">
            <span>Full name</span>
            <strong>{user.full_name}</strong>
          </div>

          <div className="ot-account-field">
            <span>Email address</span>
            <strong>{user.email}</strong>
          </div>

          <div className="ot-account-field">
            <span>Account status</span>

            <strong
              className={
                user.is_active
                  ? "ot-account-active"
                  : "ot-account-inactive"
              }
            >
              <span className="ot-status-dot" />
              {user.is_active ? "Active" : "Inactive"}
            </strong>
          </div>
        </div>

        <div className="ot-account-footer">
          <Link to="/" className="ot-text-button">
            Back to Home <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            className="ot-outline-button"
            onClick={() => navigate("/history")}
          >
            View History <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <p className="ot-dashboard-disclaimer">
        OfferTrace identifies potential warning signals using
        available information. A low risk score does not guarantee
        that an opportunity is legitimate.
      </p>
    </main>
  );
}

export default Dashboard;