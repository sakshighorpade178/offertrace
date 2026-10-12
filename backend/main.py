
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import psycopg
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field
import re
from urllib.parse import urlparse
from psycopg.types.json import Jsonb

# --------------------------------------------------
# 1. Environment Configuration
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

password_hash = PasswordHash.recommended()

# Swagger OAuth2 uses the form-based token endpoint.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# --------------------------------------------------
# 2. FastAPI Application
# --------------------------------------------------

app = FastAPI(
    title="OfferTrace API",
    description="API for verifying internship and job opportunities.",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://offertrace.vercel.app",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# 3. Request Models
# --------------------------------------------------

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)



class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class VerificationRequest(BaseModel):
    subject: str | None = Field(default=None, max_length=500)
    sender_email: EmailStr | None = None
    email_body: str | None = Field(default=None, max_length=30000)
    url: str | None = Field(default=None, max_length=2048)



# --------------------------------------------------
# 4. Database Connection
# --------------------------------------------------

def get_db_connection():
    if not DATABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database configuration is missing.",
        )

    try:
        return psycopg.connect(
            DATABASE_URL,
            connect_timeout=5,
        )
    except psycopg.Error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to connect to the database.",
        )


# --------------------------------------------------
# 5. Password Helpers
# --------------------------------------------------

def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        return password_hash.verify(password, stored_hash)
    except (ValueError, TypeError):
        return False


# --------------------------------------------------
# 6. JWT Token Helper
# --------------------------------------------------

def create_access_token(user_id: int) -> str:
    if not JWT_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication configuration is missing.",
        )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
        "iat": now,
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


# --------------------------------------------------
# 7. Current User Authentication
# --------------------------------------------------

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not JWT_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication configuration is missing.",
        )

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        subject = payload.get("sub")

        if not subject:
            raise credentials_error

        user_id = int(subject)

    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_error

    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, full_name, email, is_active
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            user = cursor.fetchone()

    if not user or not user[3]:
        raise credentials_error

    return {
        "id": user[0],
        "full_name": user[1],
        "email": user[2],
        "is_active": user[3],
    }


# --------------------------------------------------
# 8. Home and Health Endpoints
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to OfferTrace API!",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OfferTrace Backend",
    }


@app.get("/health/database")
def database_health_check():
    if not DATABASE_URL:
        return {
            "status": "error",
            "message": "DATABASE_URL is not configured.",
        }

    try:
        with psycopg.connect(
            DATABASE_URL,
            connect_timeout=5,
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT current_database(), current_user"
                )
                database_name, database_user = cursor.fetchone()

        return {
            "status": "connected",
            "database": database_name,
            "user": database_user,
        }

    except psycopg.Error:
        return {
            "status": "error",
            "message": "Database connection failed. Check the configuration.",
        }


# --------------------------------------------------
# 9. User Registration
# --------------------------------------------------

@app.post(
    "/auth/register",
    status_code=status.HTTP_201_CREATED,
)
def register_user(request: RegisterRequest):
    normalized_email = str(request.email).strip().lower()
    normalized_name = request.full_name.strip()

    if len(normalized_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please enter a valid full name.",
        )

    encoded_password = hash_password(request.password)

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (
                        full_name,
                        email,
                        password_hash
                    )
                    VALUES (%s, %s, %s)
                    RETURNING id, full_name, email, created_at
                    """,
                    (
                        normalized_name,
                        normalized_email,
                        encoded_password,
                    ),
                )
                user = cursor.fetchone()

        return {
            "message": "Registration successful.",
            "user": {
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "created_at": user[3],
            },
        }

    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    except HTTPException:
        raise

    except psycopg.Error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Registration could not be completed.",
        )


# --------------------------------------------------
# 10. JSON Login API (For React Frontend)
# --------------------------------------------------

def authenticate_user(email: str, password: str):
    normalized_email = email.strip().lower()

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, full_name, email, password_hash, is_active
                    FROM users
                    WHERE email = %s
                    """,
                    (normalized_email,),
                )
                user = cursor.fetchone()

    except psycopg.Error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login service is temporarily unavailable.",
        )

    if (
        not user
        or not verify_password(password, user[3])
        or not user[4]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
    )

    return user


@app.post("/auth/login")
def login_user(request: LoginRequest):
    user = authenticate_user(
        str(request.email),
        request.password,
    )

    token = create_access_token(user[0])

    return {
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user[0],
            "full_name": user[1],
            "email": user[2],
        },
    }


# --------------------------------------------------
# 11. Form Login API (For Swagger Authorize)
# --------------------------------------------------

@app.post("/auth/token", include_in_schema=False)
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    # OAuth2 sends the email through its "username" field.
    user = authenticate_user(
        form_data.username,
        form_data.password,
    )

    token = create_access_token(user[0])

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# --------------------------------------------------
# 12. Current Authenticated User
# --------------------------------------------------

@app.get("/auth/me")
def read_current_user(
    current_user: dict = Depends(get_current_user),
):
    return current_user

def extract_urls(text: str | None) -> list[str]:
    """Extract HTTP/HTTPS URLs from submitted text."""
    if not text:
        return []

    found_urls = re.findall(r"https?://[^\s<>\"']+", text, flags=re.IGNORECASE)

    cleaned_urls = []
    for item in found_urls:
        cleaned = item.rstrip(".,;:!?)]}")
        if cleaned and cleaned not in cleaned_urls:
            cleaned_urls.append(cleaned)

    return cleaned_urls
def analyze_email_signals(email_body: str | None) -> dict:
    """Identify basic warning signs in an email."""
    text = (email_body or "").lower()

    score = 0
    evidence = []

    payment_keywords = [
        "registration fee",
        "processing fee",
        "security deposit",
        "training fee",
        "pay now",
        "payment required",
        "pay to apply",
    ]

    urgency_keywords = [
        "act immediately",
        "urgent",
        "within 24 hours",
        "limited time",
        "respond immediately",
        "apply immediately",
    ]

    unrealistic_keywords = [
        "guaranteed selection",
        "guaranteed job",
        "earn thousands daily",
        "no interview required",
    ]

    if any(keyword in text for keyword in payment_keywords):
        score += 25
        evidence.append({
            "category": "payment_request",
            "severity": "high",
            "title": "Possible payment request",
            "description": (
                "The email contains language associated with "
                "application fees or other payment requests. "
                "Verify the request through an official channel."
            ),
        })

    if any(keyword in text for keyword in urgency_keywords):
        score += 10
        evidence.append({
            "category": "urgency",
            "severity": "medium",
            "title": "Urgency or time pressure",
            "description": (
                "The email appears to pressure the recipient "
                "to respond or act quickly."
            ),
        })

    if any(keyword in text for keyword in unrealistic_keywords):
        score += 20
        evidence.append({
            "category": "unrealistic_promise",
            "severity": "high",
            "title": "Potentially unrealistic promise",
            "description": (
                "The email contains a claim about guaranteed "
                "selection, employment, or earnings that needs "
                "independent verification."
            ),
        })

    return {
        "risk_score": min(score, 100),
        "evidence": evidence,
    }




def analyze_url_signals(url: str) -> dict:
    """Check basic URL warning signs without visiting the URL."""
    evidence = []
    score = 0

    cleaned_url = url.strip()
    parsed = urlparse(cleaned_url)
    hostname = parsed.hostname

    if parsed.scheme.lower() != "https":
        score += 15
        evidence.append({
            "category": "url_security",
            "severity": "medium",
            "title": "HTTPS is not being used",
            "description": (
                "This URL does not use HTTPS. This is a warning "
                "signal, but HTTP alone does not prove a scam."
            ),
        })

    if not hostname:
        score += 30
        evidence.append({
            "category": "invalid_url",
            "severity": "high",
            "title": "URL could not be interpreted",
            "description": "The submitted URL does not contain a valid hostname.",
        })
    else:
        hostname = hostname.lower()

        if hostname.startswith("xn--") or ".xn--" in hostname:
            score += 20
            evidence.append({
                "category": "suspicious_domain",
                "severity": "high",
                "title": "Internationalized domain detected",
                "description": (
                    "The domain contains an encoded internationalized "
                    "label. Inspect it carefully for lookalike characters."
                ),
            })

        if parsed.username or parsed.password:
            score += 25
            evidence.append({
                "category": "suspicious_url_format",
                "severity": "high",
                "title": "Credentials appear inside the URL",
                "description": (
                    "The URL contains user information before the hostname. "
                    "Check carefully that it is not disguising the real destination."
                ),
            })

    return {
        "risk_score": min(score, 100),
        "evidence": evidence,
        "hostname": hostname,
        "uses_https": parsed.scheme.lower() == "https",
    }

@app.post("/verification/analyze")
def analyze_opportunity(
    request: VerificationRequest,
    current_user: dict = Depends(get_current_user),
):
    email_body = (request.email_body or "").strip()
    subject = (request.subject or "").strip() or None
    sender_email = (
        str(request.sender_email).strip().lower()
        if request.sender_email
        else None
    )
    submitted_url = (request.url or "").strip() or None

    if not email_body and not submitted_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an email body or a URL to analyze.",
        )

    extracted_urls = extract_urls(email_body)

    if submitted_url:
        extracted_urls = list(dict.fromkeys(
            [submitted_url] + extracted_urls
        ))

    email_result = analyze_email_signals(email_body)

    url_results = [
        {
            "url": item,
            **analyze_url_signals(item),
        }
        for item in extracted_urls
    ]

    all_evidence = list(email_result["evidence"])

    for result in url_results:
        for item in result["evidence"]:
            all_evidence.append({
                **item,
                "source_url": result["url"],
            })

    email_score = email_result["risk_score"]
    url_score = max(
        (item["risk_score"] for item in url_results),
        default=0,
    )

    risk_score = min(100, email_score + url_score)

    if risk_score >= 70:
        risk_level = "critical"
    elif risk_score >= 40:
        risk_level = "high"
    elif risk_score >= 20:
        risk_level = "medium"
    else:
        risk_level = "low"

    if risk_score >= 70:
        verdict = "likely_scam"
    elif risk_score >= 40:
        verdict = "suspicious"
    else:
        verdict = "inconclusive"

    if all_evidence:
        summary = (
            f"Found {len(all_evidence)} potential warning signal(s). "
            "Review the evidence before trusting this opportunity."
        )
    else:
        summary = (
            "No warning signals were detected by the basic checks. "
            "This does not prove that the opportunity is genuine."
        )

    sender_domain = (
        sender_email.rsplit("@", 1)[-1]
        if sender_email and "@" in sender_email
        else None
    )

    email_submission_id = None

    with get_db_connection() as connection:
        with connection.cursor() as cursor:

            if email_body or subject or sender_email:
                cursor.execute(
                    """
                    INSERT INTO email_submissions (
                        user_id,
                        subject,
                        sender_email,
                        sender_domain,
                        email_body,
                        extracted_urls
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        current_user["id"],
                        subject,
                        sender_email,
                        sender_domain,
                        email_body or None,
                        Jsonb(extracted_urls),
                    ),
                )

                email_submission_id = cursor.fetchone()[0]

            cursor.execute(
                """
                INSERT INTO verification_reports (
                    user_id,
                    email_submission_id,
                    submitted_url,
                    risk_score,
                    risk_level,
                    verdict,
                    summary,
                    analysis_status,
                    analyzed_at
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, 'completed',
                    CURRENT_TIMESTAMP
                )
                RETURNING id
                """,
                (
                    current_user["id"],
                    email_submission_id,
                    submitted_url,
                    risk_score,
                    risk_level,
                    verdict,
                    summary,
                ),
            )

            report_id = cursor.fetchone()[0]

            for item in all_evidence:
                cursor.execute(
                    """
                    INSERT INTO evidence_items (
                        report_id,
                        category,
                        severity,
                        title,
                        description,
                        source_url,
                        evidence_data
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        report_id,
                        item["category"],
                        item["severity"],
                        item["title"],
                        item["description"],
                        item.get("source_url"),
                        Jsonb(item),
                    ),
                )

            for result in url_results:
                hostname = result.get("hostname")

                cursor.execute(
                    """
                    INSERT INTO url_checks (
                        report_id,
                        submitted_url,
                        normalized_domain,
                        is_https,
                        domain_matches_official,
                        check_result,
                        details,
                        checked_at
                    )
                    VALUES (%s, %s, %s, %s, NULL, %s, %s, CURRENT_TIMESTAMP)
                    """,
                    (
                        report_id,
                        result["url"],
                        hostname,
                        result["uses_https"],
                        (
                            "warning"
                            if result["evidence"]
                            else "inconclusive"
                        ),
                        Jsonb(result),
                    ),
                )

            cursor.execute(
                """
                INSERT INTO verification_history (user_id, report_id)
                VALUES (%s, %s)
                ON CONFLICT (user_id, report_id) DO NOTHING
                """,
                (current_user["id"], report_id),
            )

    return {
        "report_id": report_id,
        "risk_score": float(risk_score),
        "risk_level": risk_level,
        "verdict": verdict,
        "summary": summary,
        "evidence": all_evidence,
        "checked_urls": url_results,
    }
@app.get("/verification/history")
def get_verification_history(
    current_user: dict = Depends(get_current_user),
):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    vr.id AS report_id,
                    vr.submitted_url,
                    vr.risk_score,
                    vr.risk_level,
                    vr.verdict,
                    vr.summary,
                    vr.analysis_status,
                    vr.analyzed_at,
                    vr.created_at,
                    es.subject,
                    es.sender_email
                FROM verification_history vh
                JOIN verification_reports vr
                    ON vr.id = vh.report_id
                LEFT JOIN email_submissions es
                    ON es.id = vr.email_submission_id
                WHERE vh.user_id = %s
                  AND vr.user_id = %s
                ORDER BY vr.created_at DESC
                LIMIT 100
                """,
                (current_user["id"], current_user["id"]),
            )

            rows = cursor.fetchall()

    history = []

    for row in rows:
        history.append({
            "report_id": row[0],
            "submitted_url": row[1],
            "risk_score": (
                float(row[2]) if row[2] is not None else None
            ),
            "risk_level": row[3],
            "verdict": row[4],
            "summary": row[5],
            "analysis_status": row[6],
            "analyzed_at": (
                row[7].isoformat() if row[7] else None
            ),
            "created_at": (
                row[8].isoformat() if row[8] else None
            ),
            "subject": row[9],
            "sender_email": row[10],
        })

    return {
        "total": len(history),
        "history": history,
    }
