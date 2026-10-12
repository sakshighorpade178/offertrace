
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    official_domain VARCHAR(255),
    official_website TEXT,
    careers_url TEXT,
    description TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN (
            'unverified', 'partially_verified', 'verified', 'flagged'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_name
    ON companies (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_companies_domain
    ON companies (official_domain);

CREATE TABLE IF NOT EXISTS opportunities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    opportunity_type VARCHAR(30) NOT NULL
        CHECK (opportunity_type IN (
            'internship', 'full_time', 'part_time', 'contract', 'other'
        )),
    description TEXT,
    source_url TEXT,
    official_url TEXT,
    application_url TEXT,
    location VARCHAR(255),
    is_paid BOOLEAN,
    stipend_min NUMERIC(12, 2),
    stipend_max NUMERIC(12, 2),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'unverified'
        CHECK (status IN (
            'unverified', 'verified', 'suspicious', 'closed'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (stipend_min IS NULL OR stipend_min >= 0),
    CHECK (stipend_max IS NULL OR stipend_max >= 0),
    CHECK (
        stipend_min IS NULL OR stipend_max IS NULL
        OR stipend_max >= stipend_min
    )
);

CREATE INDEX IF NOT EXISTS idx_opportunities_company
    ON opportunities (company_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_status
    ON opportunities (status);

CREATE TABLE IF NOT EXISTS email_submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    sender_email VARCHAR(320),
    sender_domain VARCHAR(255),
    email_body TEXT,
    extracted_urls JSONB NOT NULL DEFAULT '[]'::JSONB,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_submissions_user
    ON email_submissions (user_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS verification_reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    opportunity_id BIGINT REFERENCES opportunities(id) ON DELETE SET NULL,
    email_submission_id BIGINT
        REFERENCES email_submissions(id) ON DELETE SET NULL,
    submitted_url TEXT,
    risk_score NUMERIC(5, 2)
        CHECK (risk_score IS NULL OR risk_score BETWEEN 0 AND 100),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (risk_level IN (
            'pending', 'low', 'medium', 'high', 'critical', 'inconclusive'
        )),
    verdict VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (verdict IN (
            'pending', 'likely_legitimate', 'suspicious',
            'likely_scam', 'inconclusive'
        )),
    summary TEXT,
    official_source_url TEXT,
    analysis_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (analysis_status IN (
            'pending', 'processing', 'completed', 'failed'
        )),
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user_date
    ON verification_reports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_risk
    ON verification_reports (risk_level, verdict);

CREATE TABLE IF NOT EXISTS evidence_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_id BIGINT NOT NULL
        REFERENCES verification_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (severity IN (
            'info', 'low', 'medium', 'high', 'critical'
        )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_url TEXT,
    evidence_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_report
    ON evidence_items (report_id);

CREATE TABLE IF NOT EXISTS verification_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id BIGINT NOT NULL
        REFERENCES verification_reports(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, report_id)
);

CREATE INDEX IF NOT EXISTS idx_history_user_date
    ON verification_history (user_id, viewed_at DESC);

CREATE TABLE IF NOT EXISTS url_checks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_id BIGINT NOT NULL
        REFERENCES verification_reports(id) ON DELETE CASCADE,
    submitted_url TEXT NOT NULL,
    normalized_domain VARCHAR(255),
    is_https BOOLEAN,
    domain_matches_official BOOLEAN,
    redirect_url TEXT,
    check_result VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (check_result IN (
            'pending', 'safe_signal', 'warning', 'danger',
            'inconclusive', 'error'
        )),
    details JSONB NOT NULL DEFAULT '{}'::JSONB,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_url_checks_report
    ON url_checks (report_id);

CREATE INDEX IF NOT EXISTS idx_url_checks_domain
    ON url_checks (normalized_domain);
