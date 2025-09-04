# 📄 Product Requirements Document (PRD)

## 1. Problem Statement

> Describe the core user problems you’re solving.
> Focus on the _pain_, not the solution.

**Example:**

- Users can’t efficiently discover relevant foreclosure auctions.
- SHAB listings lack filtering, forcing manual daily scanning.
- Investors with less time or regional knowledge are at a disadvantage.

---

## 2. Business Context & Opportunity

> Outline the strategic motivation for solving this problem.
> Why now? Why us? What’s the opportunity?

**Include:**

- Market demand or inefficiencies
- Competitor landscape
- Monetization potential
- Business moat or edge

**Example:**

- Market gap: Existing tools rely on manual processes and cost CHF 15–50/month.
- Competitive moat: LLM-powered pipeline allows real-time auction enrichment.
- TAM: Thousands of Swiss private and professional real estate investors.

---

## 3. 🔍 Solution Snapshot (1-paragraph summary)

> Quick overview for any reader: What are we building and for whom?

**Example:**

> _Auctiondeal is an AI-powered Swiss auction discovery platform. It helps property investors find and evaluate foreclosure listings faster using smart filters, map exploration, and enriched data from SHAB and cantonal sources._

---

## 4. Personas / Target Users

> Who are your primary users? Summarize their needs, behaviors, and goals.

**Persona Template:**

### Persona 1: _Thomas, the Private Investor_

- Age 38, owns 2 rental properties
- Spends 30 min/day browsing SHAB + Excel
- Wants high-value MFH deals near Zürich
- Tech-savvy but time-constrained

### Persona 2: _Sandra, the Small Real Estate Pro_

- Operates a 3-person firm focused on foreclosures
- Subscribes to SHAB aggregators but finds them clunky
- Wants to automate filtering + build team workflows

---

## 5. 🎯 Critical User Journeys (CUJs)

> Describe the most important end-to-end user flows.

### CUJ-1: Explore Swiss Auctions on Map (Desktop)

**Persona**: Thomas  
**Goal**: Quickly find relevant MFH properties using map filters.

**Steps**:

1. Opens homepage, sees map of Switzerland
2. Applies filters: property type = MFH, price = 500k–1M, region = ZH
3. Hovers pins to preview auctions
4. Clicks pin → sees full details
5. Decides whether to mark for follow-up

**Supported Features**:

- Map Interface
- Filtering System
- Property Detail Page

**Success Criteria**:

- 60% hover interaction
- 25% navigate to detail

---

## 6. 🧩 Solution Overview

> High-level view of how the product works and delivers value.

### Core Components:

1. **SHAB Data Pipeline** – Automated daily sync + LLM parsing
2. **Map UI** – Interactive Swiss map with pins and filters
3. **Auction Intelligence** – Enriched data: value, type, imagery
4. **Notification System** – Saved searches + email alerts (Phase 2+)

### Architecture Sketch:

_(Optional: Add visual or link to diagram)_

---

## 7. 🚀 Implementation Roadmap

> Phased delivery plan with key features and success metrics.

### Phase 1 – MVP Beta (30 Days)

- Features: SHAB sync, Map, Filtering, Mobile
- Goal: Validate usage
- KPI: 100 Monthly Active Users

### Phase 2 – Free Accounts (2 Months Later)

- Features: Saved searches, email alerts
- KPI: 60% conversion to registered users

### Phase 3 – Premium Tier

- Features: Data export, advanced filters
- KPI: 15% trial-to-paid conversion

_(Add more phases as needed)_

---

## 8. 📦 Feature List & User Stories

> Group user stories under major feature areas.

### Feature Area 1: SHAB Data Ingestion

**Purpose**: Aggregate and structure SHAB foreclosure listings.

**User Stories:**

- As a **system**, I want to fetch daily SHAB XML with filters, so no listings are missed.
- As a **system**, I want to parse and classify auction objects to extract property type and value.

**Acceptance Criteria**:

- Daily sync
- 95% parsing accuracy
- Classified into 6 categories

---

### Feature Area 2: Interactive Map Interface

**Purpose**: Let users explore auctions visually.

**User Stories:**

- As a **user**, I want to filter auctions by region and property type on the map.
- As a **user**, I want to hover over pins to preview auction details.

**Acceptance Criteria**:

- Pin clustering
- Color-coded pins by property type
- Responsive design for desktop/mobile

---

### Feature Area 3: Property Detail Page

**Purpose**: Provide full auction details for decision-making.

**User Stories:**

- As a **user**, I want to see full auction details (value, logistics, legal info).
- As a **user**, I want a shareable URL for each property.

**Acceptance Criteria**:

- LLM parsing for estimated value, location, dates
- Street view integration (if available)

---

## 9. ⚙️ Non-Functional Requirements

> List performance, compliance, or reliability requirements.

**Examples**:

- Mobile-first layout: Must support iOS Safari, Android Chrome
- Map load time < 2 seconds (95th percentile)
- Daily data updates by 5 AM CET
- GDPR-compliant data storage
- SEO-friendly URLs

---

## 10. 🧯 Out of Scope

> Clarify what's intentionally not included in this phase.

**Examples**:

- No bidding integration (info-only site)
- No user-generated content
- No multi-property parsing (only 1 per auction for MVP)

---

## 11. ❓ Risks & Open Questions

> Known uncertainties or dependencies.

**Examples**:

- What if SHAB API format changes?
- How reliable is LLM classification for legal German text?
- Do we need licenses for aerial imagery?

---

## 12. 📎 Appendices & Links

- [Figma Prototype](#)
- [SHAB API Docs](#)
- [Data Model Schema](#)
- [Design Tokens & Color Codes](#)

---
