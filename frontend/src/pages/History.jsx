import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  History as HistoryIcon,
  FileSearch,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { getVerificationHistory } from "../services/api";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function History() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  async function loadHistory() {
    const token = sessionStorage.getItem("offertrace_access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getVerificationHistory(token);
      setReports(Array.isArray(result.history) ? result.history : []);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load your verification history."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredReports = reports.filter((report) => {
    const searchValue = [
      report.subject,
      report.sender_email,
      report.submitted_url,
      report.verdict,
      `report ${report.report_id}`,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchValue.includes(
      searchTerm.trim().toLowerCase()
    );

    const matchesRisk =
      riskFilter === "all" || report.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  function getVerdictLabel(verdict) {
    const labels = {
      likely_legitimate: "Likely legitimate",
      likely_scam: "Likely scam",
      suspicious: "Suspicious",
      inconclusive: "Inconclusive",
      pending: "Pending",
    };

    return labels[verdict] || "Inconclusive";
  }

  return (
    <main className="ot-page">
      <div className="ot-container ot-history-page">
        <button
          type="button"
          className="ot-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <header className="ot-page-heading ot-history-heading">
          <div>
            <div className="ot-icon-box">
              <HistoryIcon size={25} />
            </div>

            <p className="ot-eyebrow">YOUR ACTIVITY</p>

            <h1>Verification History</h1>

            <p className="ot-page-description">
              Review your previous opportunity checks, risk assessments,
              and the warning signals identified in each report.
            </p>
          </div>

          <div className="ot-history-heading-icon">
            <ShieldCheck size={42} strokeWidth={1.5} />
          </div>
        </header>

        <section className="ot-history-summary">
          <div className="ot-history-summary-icon">
            <FileSearch size={23} />
          </div>

          <div>
            <span>Total saved reports</span>
            <strong>{reports.length}</strong>
          </div>

          <button
            type="button"
            className="ot-outline-button"
            onClick={loadHistory}
            disabled={isLoading}
          >
            <RefreshCw
              size={16}
              className={isLoading ? "ot-history-spinning" : ""}
            />
            Refresh
          </button>
        </section>

        <section className="ot-history-toolbar">
          <label className="ot-history-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search by subject, email, URL or report ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <select
            className="ot-history-filter"
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            aria-label="Filter reports by risk level"
          >
            <option value="all">All risk levels</option>
            <option value="low">Low risk</option>
            <option value="medium">Medium risk</option>
            <option value="high">High risk</option>
            <option value="critical">Critical risk</option>
            <option value="inconclusive">Inconclusive</option>
            <option value="pending">Pending</option>
          </select>
        </section>

        {isLoading ? (
          <section className="ot-history-state">
            <RefreshCw size={28} className="ot-history-spinning" />
            <h2>Loading your reports...</h2>
            <p>Retrieving your saved verification history.</p>
          </section>
        ) : error ? (
          <section className="ot-history-state ot-history-error">
            <AlertTriangle size={30} />
            <h2>History could not be loaded</h2>
            <p>{error}</p>

            <button
              type="button"
              className="ot-button ot-button-primary"
              onClick={loadHistory}
            >
              Try Again
            </button>
          </section>
        ) : filteredReports.length === 0 ? (
          <section className="ot-history-state">
            <div className="ot-history-empty-icon">
              <FileSearch size={31} />
            </div>

            <h2>
              {reports.length === 0
                ? "No verification reports yet"
                : "No matching reports"}
            </h2>

            <p>
              {reports.length === 0
                ? "Your completed opportunity checks will appear here."
                : "Try changing your search or selecting another risk level."}
            </p>

            {reports.length === 0 && (
              <button
                type="button"
                className="ot-button ot-button-primary"
                onClick={() => navigate("/verify")}
              >
                Verify an Opportunity
                <ArrowRight size={17} />
              </button>
            )}
          </section>
        ) : (
          <section className="ot-history-list">
            <div className="ot-history-list-heading">
              <h2>Your reports</h2>
              <span>
                {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "report" : "reports"}
              </span>
            </div>

            {filteredReports.map((report) => (
              <article
                className="ot-history-report"
                key={report.report_id}
              >
                <div className="ot-history-report-main">
                  <div className="ot-history-report-icon">
                    <FileSearch size={22} />
                  </div>

                  <div className="ot-history-report-content">
                    <div className="ot-history-report-title-row">
                      <h3>
                        {report.subject?.trim() ||
                          report.submitted_url ||
                          "Opportunity verification"}
                      </h3>

                      <span
                        className={`ot-risk-badge ot-risk-${
                          report.risk_level || "unknown"
                        }`}
                      >
                        {(report.risk_level || "Unknown")
                          .charAt(0)
                          .toUpperCase() +
                          (report.risk_level || "unknown").slice(1)}
                      </span>
                    </div>

                    <p className="ot-history-report-meta">
                      Report #{report.report_id}
                      {report.sender_email
                        ? ` · ${report.sender_email}`
                        : ""}
                    </p>

                    <p className="ot-history-report-summary">
                      {report.summary ||
                        "No summary is available for this report."}
                    </p>

                    <div className="ot-history-report-date">
                      <CalendarDays size={15} />
                      {formatDate(report.analyzed_at || report.created_at)}
                    </div>

                    {report.submitted_url && (
                      <a
                        className="ot-history-url"
                        href={report.submitted_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                        {report.submitted_url}
                      </a>
                    )}
                  </div>
                </div>

                <div className="ot-history-report-result">
                  <span className="ot-history-score-label">Risk score</span>

                  <strong>
                    {report.risk_score ?? "—"}
                    <small>/100</small>
                  </strong>

                  <span className="ot-history-verdict">
                    {getVerdictLabel(report.verdict)}
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}

        <p className="ot-report-disclaimer">
          These reports provide preliminary risk assessments based on
          available signals. A low score does not prove an opportunity
          is genuine. Verify employers independently through official
          channels.
        </p>
      </div>
    </main>
  );
}

export default History;