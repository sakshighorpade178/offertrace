# 📋 OfferTrace — Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** OfferTrace
**Category:** Web Application — Opportunity Verification
**Target Users:** Students, fresh graduates, and job seekers.

OfferTrace is a web application designed to help users evaluate internship and job opportunities by identifying potential warning signs in opportunity-related emails and URLs.

## 2. Problem Statement

Students and job seekers frequently receive internship offers, recruitment emails, and online opportunity links. Some may contain misleading information, suspicious URLs, or other scam indicators.

Users need a convenient way to review these opportunities and understand potential risks before proceeding.

## 3. Product Goals

* Help users identify potential warning signs in job and internship opportunities.
* Provide understandable risk assessments with supporting reasons.
* Allow registered users to review their verification history.
* Offer a simple, accessible, and professional user interface.
* Encourage users to verify opportunities through official company sources.

## 4. Target Audience

* College students searching for internships.
* Fresh graduates looking for entry-level jobs.
* Job seekers receiving recruitment emails.
* Users who want to assess suspicious opportunity links.

## 5. Core Features

### 5.1 User Registration and Login

Users can create an account and log in to access protected application features.

### 5.2 Opportunity Verification

Users can submit supported opportunity details, emails, or URLs for analysis.

### 5.3 Risk Indicator Analysis

The backend applies rule-based checks to identify potential warning signs.

### 5.4 Verification Report

The application presents an assessment and relevant reasons to help users understand the identified indicators.

### 5.5 Verification History

Authenticated users can access their previous verification records, subject to the application's data and API implementation.

### 5.6 Responsive User Interface

The React frontend provides the application's navigation, forms, and results views.

## 6. Functional Requirements

| ID    | Requirement                                                        | Priority |
| ----- | ------------------------------------------------------------------ | -------- |
| FR-01 | Users can register an account.                                     | High     |
| FR-02 | Users can log in.                                                  | High     |
| FR-03 | The system accepts supported opportunity information for analysis. | High     |
| FR-04 | The backend checks for configured risk indicators.                 | High     |
| FR-05 | The system returns an analysis result with reasons.                | High     |
| FR-06 | Authenticated users can request their verification history.        | High     |
| FR-07 | The frontend communicates with the backend API.                    | High     |
| FR-08 | The application provides clear feedback when an API request fails. | Medium   |

## 7. Non-Functional Requirements

* **Security:** Sensitive credentials and secrets must not be committed to source control.
* **Usability:** Results should be understandable to non-technical users.
* **Maintainability:** Frontend, backend, and database responsibilities should remain separated.
* **Reliability:** API errors should be handled gracefully.
* **Performance:** Common operations should complete within a reasonable response time.
* **Privacy:** User data should be handled responsibly.

## 8. Technology Stack

| Component        | Technology         |
| ---------------- | ------------------ |
| Frontend         | React              |
| Build Tool       | Vite               |
| Routing          | React Router       |
| Backend          | Python and FastAPI |
| Database         | PostgreSQL         |
| Authentication   | JWT                |
| API Style        | REST               |
| Version Control  | Git and GitHub     |
| Frontend Hosting | Vercel             |

## 9. Success Criteria

* Users can access the application interface.
* Registration and login work with the configured backend.
* Supported opportunity inputs can be analyzed.
* Results provide useful explanations of detected indicators.
* Authenticated users can retrieve their verification history.
* Production configuration allows the public frontend to communicate securely with the deployed backend.

## 10. Limitations and Responsible Use

OfferTrace provides preliminary, rule-based risk indicators. It does not g
