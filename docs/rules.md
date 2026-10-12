# 🛡️ OfferTrace — Risk Analysis Rules

<p align="center">

  <img src="https://img.shields.io/badge/Module-Risk%20Analysis-7C3AED?style=for-the-badge" alt="Risk Analysis"/>
  <img src="https://img.shields.io/badge/Approach-Rule--Based-2563EB?style=for-the-badge" alt="Rule Based"/>
  <img src="https://img.shields.io/badge/Focus-Online%20Opportunity%20Safety-059669?style=for-the-badge" alt="Opportunity Safety"/>

</p>

> 🔎 **Our principle:** Identify warning signs, explain the evidence, and help users make informed decisions.

---

## 🎯 1. Purpose

OfferTrace analyzes supported job opportunities, internship offers, emails, and URLs for potential warning signs.

The initial system uses configured, rule-based checks to identify signals that may deserve further investigation.

**Important:** A warning sign does not automatically prove fraud, and the absence of warning signs does not guarantee that an opportunity is genuine.

---

## 🔍 2. Risk Indicator Categories

| Category            | 🔎 What to Examine                                               | ⚠️ Why It Matters                                          |
| :------------------ | :--------------------------------------------------------------- | :--------------------------------------------------------- |
| 🌐 URL              | Unusual domains, misleading hostnames, or unexpected redirects   | The destination may not belong to the claimed organization |
| 🏢 Company Identity | Differences between the claimed company and the linked domain    | Impersonation may be possible                              |
| 📧 Email            | Sender address and domain inconsistencies                        | The sender may not represent the claimed organization      |
| 💰 Payment Requests | Requests for registration fees or payments to secure an offer    | Some recruitment scams demand money upfront                |
| 🚨 Urgency          | Pressure to act immediately without reasonable verification time | Pressure may discourage careful investigation              |
| 📄 Offer Details    | Missing or inconsistent role, recruiter, or company information  | Important details may need independent confirmation        |

> These categories describe useful investigation signals. A category should only affect the actual assessment if the corresponding check is implemented in the backend.

---

## 🌈 3. Risk Analysis Workflow

```mermaid id="f2g7h3"
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#DBEAFE','primaryTextColor':'#1E3A8A','primaryBorderColor':'#2563EB','lineColor':'#64748B','fontFamily':'Arial'}}}%%
flowchart TD
    A(["📩 Opportunity Submitted"])
    B["🧹 Validate Input"]
    C["🔎 Extract Available Signals"]
    D["🌐 Inspect URLs and Domains"]
    E["📧 Inspect Available Email Indicators"]
    F["⚠️ Evaluate Configured Rules"]
    G["📊 Prepare Assessment"]
    H["📝 Explain Detected Indicators"]
    I(["✅ Display Report"])

    A --> B --> C
    C --> D
    C --> E
    D --> F
    E --> F
    F --> G --> H --> I

    classDef start fill:#D1FAE5,stroke:#059669,color:#064E3B,stroke-width:2px
    classDef process fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A,stroke-width:2px
    classDef risk fill:#FCE7F3,stroke:#DB2777,color:#831843,stroke-width:2px
    classDef result fill:#EDE9FE,stroke:#7C3AED,color:#4C1D95,stroke-width:2px

    class A,I start
    class B,C,D,E process
    class F
```
