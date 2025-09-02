# Auctiondeal - PRD Decision Log

## Session Information
- **Product Name**: Auctiondeal
- **Session Start**: 2025-09-02 (Base PRD), 2025-09-02 (Expansion)
- **Phase**: PRD Expansion
- **Status**: In Progress

## Key Decisions Made

### Product Name Decision
- **Decision**: Product name "Auctiondeal"
- **Date**: 2025-09-02
- **Rationale**: User-provided product name
- **Context**: Initial setup for PRD creation process

### Solution Scope Decision
- **Decision**: 3-phase approach - Phase 1: Basic aggregation, Phase 2: Data enrichment (GIS/kataster), Phase 3: International expansion
- **Date**: 2025-09-02
- **Rationale**: Allows focused MVP while establishing clear expansion path
- **Context**: User clarification on scope boundaries and growth strategy

### Success Metrics Decision
- **Decision**: Monthly Paying Users as North Star KPI, with visitor→trial and trial→purchase conversion as key sub-metrics
- **Date**: 2025-09-02
- **Rationale**: Revenue-focused metrics align with subscription business model
- **Context**: User prioritized paying users over engagement metrics

### North Star Metrics Update for Phases
- **Decision**: MVP North Star = Unique Monthly Visitors, Phase 1 North Star = Monthly Paying Users
- **Date**: 2025-09-02
- **Rationale**: MVP focuses on user acquisition and validation before monetization, payments become primary metric once implemented
- **Context**: Clarification during expansion phase - different metrics for different product maturity stages

### MVP Timeline Decision
- **Decision**: Aggressive 30-day timeline to go online (end September 2025)
- **Date**: 2025-09-02
- **Rationale**: Fast market entry for validation before competition
- **Context**: Bootstrap budget requires quick MVP validation

### MVP Scope Decision
- **Decision**: Focus on core SHAB scraping, map interface, basic filtering with property categories, defer subscription/payments to Phase 1
- **Date**: 2025-09-02
- **Rationale**: Minimal viable product for market validation within 30-day constraint
- **Context**: User defined strict scope boundaries to meet timeline

## Context Discovered
- **Project Focus**: Swiss auction/foreclosure marketplace (Zwangsversteigerungen)
- **Market Analysis**: Comprehensive 90-page German analysis of Swiss foreclosure market available
- **Target Market**: Swiss real estate foreclosure auctions (primarily), vehicle and goods auctions (secondary)
- **Key Sources**: SHAB (Swiss Commercial Gazette), cantonal publications, court auctions
- **Technical Opportunity**: Automated scraper for auction data aggregation
- **Project Phase**: Market research complete, product definition needed

## Session Progress

### PRD Creation Phase (2025-09-02)
- [x] Product name established
- [x] Context analysis completed
- [x] PRD and decision files created
- [x] Problem & Opportunity section complete
- [x] Solution Concept section complete
- [x] Target Users & Success Metrics section complete
- [x] Critical User Journey section complete
- [x] MVP Scope section complete
- [x] Session completed successfully

### PRD Expansion Phase (2025-09-02)
- [x] Chapter 1: Problem Definition & Strategic Context (validated and enhanced)
  - [x] Success Hypothesis updated with Phase 1 subscription targets (300 paid subscribers in 6 months, 1000 in 18 months)
- [x] Chapter 2: Solution Architecture & Scope (complete with 5 feature areas)
  - [x] Feature Area 1: Data Collection & Processing
  - [x] Feature Area 2: Interactive Map Interface (restored missing section)
  - [x] Feature Area 3: Property Filtering System
  - [x] Feature Area 4: Results List View (new)
  - [x] Feature Area 5: Property Detail Page (new - critical missing piece identified)
  - [x] Future Roadmap (Phase 1-3 planning)
- [x] Document structure corruption fixed (removed old one-pager sections)
- [x] Mainpage architecture defined (Filters + Interactive Map + Results List)
- [x] Git repository initialized and documentation centralized in docs/
- [ ] Chapter 3: User Context & Personas (in progress)
- [ ] Chapter 4: Critical User Journeys (pending)
- [ ] Chapter 5: Implementation & Success (pending)

## Key Technical Decisions This Session
- **Map Pin Interactions**: Desktop hover cards vs mobile direct click, multi-object zoom behavior
- **Swiss Value Formatting**: "950k" for under 1M, "1.25mio" for over 1M CHF
- **Color-Coded Pins**: Land(Green), MFH(Blue), EFH(Light blue), Commercial(Violet), Various(Yellow), Parking(White)
- **OpenStreetMap**: Cost-effective mapping solution for MVP
- **LLM Processing**: Required for fuzzy German text parsing in auctionObjects and remarks fields
- **Documentation Structure**: Centralized in docs/ folder, git workflow with meaningful commits

## PRD Quality Fixes Applied
- **Pricing Math Correction**: Fixed annual discount calculation (CHF 13-17 average vs CHF 12-16 effective monthly rate)
- **Feature Scope Clarification**: MVP processes only primary property per auction, multi-object handling deferred to post-MVP
- **Timeline Consistency**: Clarified subscription launch timeline references for revenue targets
- **Duplicate Content**: Identified revenue target duplication (lines 81-87 vs 323-328) for future consolidation

---

*This log tracks all decisions and progress across PRD creation sessions.*