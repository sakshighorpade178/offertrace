import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  AlertTriangle,
  CheckCircle2,
  Info,
  Link as LinkIcon,
  Mail,
  LoaderCircle,
} from "lucide-react";
import { analyzeOpportunity } from "../services/api";

function VerifyOpportunity() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    sender_email: "",
    email_body: "",
    url: "",
  });

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setReport(null);

    const token = sessionStorage.getItem("offertrace_access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !formData.subject.trim() &&
      !formData.sender_email.trim() &&
      !formData.email_body.trim() &&
      !formData.url.trim()
    ) {
      setError("Please enter email details or an opportunity URL.");
      return;
    }

    setLoading(true);

    try {
      const result = await analyzeOpportunity(
        {
          subject: formData.subject.trim(),
          sender_email: formData.sender_email.trim(),
          email_body: formData.email_body.trim(),
          url: formData.url.trim(),
        },
        token
      );

      setReport(result);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to analyze this opportunity. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = report?.risk_level?.toLowerCase() || "unknown";

  const riskLabel = riskLevel.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

  return (
    <div className="ot-page">
      <div className="ot-container">
        <button
          type="button"
          className="ot-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <section className="ot-page-heading">
          <div className="ot-icon-box">
            <ShieldCheck size={27} />
          </div>

          <p className="ot-eyebrow">OPPORTUNITY SECURITY</p>

          <h1>Verify an Opportunity</h1>

          <p>
            Check internship and job opportunity details for potential warning
            signs before you trust them.
          </p>
        </section>

        <div className="ot-verification-layout">
          <section className="ot-card ot-verification-card">
            <div className="ot-card-heading">
              <div>
                <h2>Opportunity details</h2>
                <p>Enter the information you want to analyze.</p>
              </div>

              <ShieldCheck size={23} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ot-form-group">
                <label htmlFor="subject">
                  <Mail size={16} />
                  Email subject
                  <span className="ot-optional">Optional</span>
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Internship Offer - Software Developer"
                />
              </div>

              <div className="ot-form-group">
                <label htmlFor="sender_email">
                  Sender email
                  <span className="ot-optional">Optional</span>
                </label>

                <input
                  id="sender_email"
                  name="sender_email"
                  type="email"
                  value={formData.sender_email}
                  onChange={handleChange}
                  placeholder="e.g. recruiter@company.com"
                />
              </div>

              <div className="ot-form-group">
                <label htmlFor="email_body">
                  Email message
                  <span className="ot-optional">Optional</span>
                </label>

                <textarea
                  id="email_body"
                  name="email_body"
                  value={formData.email_body}
                  onChange={handleChange}
                  placeholder="Paste the internship or job opportunity email here..."
                  rows={6}
                />
              </div>

              <div className="ot-form-group">
                <label htmlFor="url">
                  <LinkIcon size={16} />
                  Opportunity URL
                  <span className="ot-optional">Optional</span>
                </label>

                <input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/careers"
                />

                <small>
                  Enter an email message, a URL, or both. At least one field
                  must contain information.
                </small>
              </div>

              {error && (
                <div className="ot-error-message" role="alert">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="ot-button ot-button-primary ot-analyze-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="ot-spinner" />
                    Analyzing opportunity...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Analyze Opportunity
                  </>
                )}
              </button>

              <p className="ot-privacy-note">
                <Info size={15} />
                Analysis identifies potential warning signals; it cannot
                guarantee that an opportunity is genuine or fraudulent.
              </p>
            </form>
          </section>

          <aside className="ot-card ot-verification-sidebar">
            <div className="ot-sidebar-icon">
              <ShieldCheck size={25} />
            </div>

            <h3>What we check</h3>

            <ul className="ot-check-list">
              <li>
                <CheckCircle2 size={17} />
                Payment requests and suspicious demands
              </li>

              <li>
                <CheckCircle2 size={17} />
                Urgent or high-pressure language
              </li>

              <li>
                <CheckCircle2 size={17} />
                Potentially suspicious URL characteristics
              </li>

              <li>
                <CheckCircle2 size={17} />
                Evidence-based risk indicators
              </li>
            </ul>

            <div className="ot-sidebar-tip">
              <Info size={18} />
              <p>
                Never pay an unexpected recruitment fee without independently
                verifying the employer through official channels.
              </p>
            </div>
          </aside>
        </div>

        {report && (
          <section className="ot-card ot-report-card" aria-live="polite">
            <div className="ot-report-header">
              <div>
                <p className="ot-eyebrow">ANALYSIS COMPLETE</p>
                <h2>Verification Report</h2>
                <p>{report.summary}</p>
              </div>

              <span className={`ot-risk-badge ot-risk-${riskLevel}`}>
                {riskLabel} Risk
              </span>
            </div>

            <div className="ot-report-stats">
              <div className="ot-report-stat">
                <span>Risk score</span>
                <strong>
                  {report.risk_score}
                  <small>/100</small>
                </strong>
              </div>

              <div className="ot-report-stat">
                <span>Verdict</span>
                <strong className="ot-verdict">
                  {report.verdict || "Inconclusive"}
                </strong>
              </div>

              <div className="ot-report-stat">
                <span>Report ID</span>
                <strong>#{report.report_id}</strong>
              </div>
            </div>

            <h3>Warning signals and evidence</h3>

            {report.evidence?.length > 0 ? (
              <div className="ot-evidence-list">
                {report.evidence.map((item, index) => (
                  <article
                    className="ot-evidence-item"
                    key={`${item.category}-${index}`}
                  >
                    <div className="ot-evidence-icon">
                      <AlertTriangle size={19} />
                    </div>

                    <div>
                      <div className="ot-evidence-title">
                        <h4>{item.title}</h4>
                        <span>{item.severity}</span>
                      </div>

                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="ot-empty-evidence">
                No warning signals were detected by the current checks. This
                does not establish that the opportunity is safe or genuine.
              </p>
            )}

            {report.checked_urls?.length > 0 && (
              <>
                <h3 className="ot-checked-url-heading">URL analysis</h3>

                {report.checked_urls.map((item, index) => (
                  <div className="ot-checked-url" key={`${item.url}-${index}`}>
                    <div>
                      <strong>{item.hostname || item.url}</strong>
                      <p>{item.url}</p>
                    </div>

                    <span>
                      URL risk score: {item.risk_score}/100
                    </span>

                    {item.evidence?.length > 0 && (
                      <ul>
                        {item.evidence.map((evidence, evidenceIndex) => (
                          <li key={evidenceIndex}>
                            {evidence.description || evidence.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </>
            )}

            <div className="ot-report-disclaimer">
              <Info size={18} />
              <p>
                This report is a preliminary risk assessment, not a definitive
                determination of authenticity. Verify the employer and
                opportunity independently using official contact details and
                career pages.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default VerifyOpportunity;