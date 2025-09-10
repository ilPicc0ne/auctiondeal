# Auctiondeal Product Requirements Document (PRD)

## 1. Problem Statement

Swiss property investors face significant inefficiencies when discovering and evaluating foreclosure auction opportunities. While SHAB (Swiss Commercial Gazette) serves as the official government source for all auction announcements, its unfiltered text-only format forces investors into time-consuming manual research processes. Existing commercial aggregators attempt to solve this problem but rely on expensive manual approaches with limited data enrichment, creating a market gap for automated, intelligent solutions.

**Core User Pain Points:**

- **Discovery Inefficiency**: Swiss auction seekers cannot efficiently discover relevant opportunities in their area due to SHAB's unfiltered, text-only format without property type, location radius, or value filtering
- **Information Disadvantage**: Limited auction details force manual research across inconsistent cantonal/municipal sites, creating information asymmetry that favors buyers with dedicated research resources
- **Notification Gap**: No systematic way to get alerted about relevant opportunities or filter properties and auctions within a certain distance from the investor (e.g., "multi-family homes within 30km of Zurich, CHF 400k-800k range")
- **Opportunity Evaluation Gap**: Investors receive limited information to determine the value of an opportunity and whether it's worth pursuing, lacking access to property imagery, surrounding context, zoning information, third-party valuations, and municipal location assessments
- **Research Time Sink**: Each interesting auction requires manual investigation across multiple fragmented sources to gather basic property intelligence

**Competitive Landscape:**

Existing competitors (AuctionHome, Local Auction, Zwangsversteigerung.ch) charge CHF 15-50/month but rely on manual data collection processes, resulting in limited filtering capabilities, weekly update cycles, and basic property information. These manual approaches create scalability constraints and higher costs while providing inferior user experience.

**Impact on Target Users:**

- Individual investors miss opportunities due to inability to filter SHAB's data stream
- Small real estate firms cannot efficiently monitor territories without manual daily screening
- Time-constrained investors are at competitive disadvantage versus those with dedicated research teams

---

## 2. Business Context & Opportunity

### Market Opportunity

Swiss property foreclosure auctions represent a significant market inefficiency with validated demand. Multiple existing competitors charge CHF 15-50/month for auction aggregation services, clearly demonstrating market willingness to pay. However, these solutions create a technology-driven opportunity due to their fundamental reliance on manual data collection processes.

**Market Dynamics:**

- **Target Addressable Market**: Swiss individual property investors and small real estate firms (2-10 employees) currently underserved by expensive professional tools
- **Validated Demand**: Existing competitors at CHF 15-50/month price points prove market appetite for aggregated auction data
- **Market Gap**: Current solutions rely on manual processes, creating scalability constraints and limiting feature development
- **Geographic Advantage**: Switzerland's centralized SHAB system provides single authoritative source for comprehensive national coverage

### Competitive Landscape

**Current Market Players:**

- **AuctionHome, Local Auction, Zwangsversteigerung.ch**: CHF 15-50/month subscription services with varying levels of data sophistication
- **Mixed Automation Levels**: Competitors likely employ some scraping and automated data collection, but with different degrees of enrichment and presentation quality
- **Differentiated Offerings**: Each platform shows distinct approaches to data richness, user interface design, and feature sets
- **Market Fragmentation**: No single dominant player has captured the majority market share, indicating room for disruption

**Competitive Opportunity:**

While existing players demonstrate market validation and varying levels of technical sophistication, significant opportunity remains to capture market share through a superior platform combining:

- **Enhanced Data Intelligence**: More comprehensive property enrichment and parsing accuracy
- **Superior User Experience**: Better filtering, visualization, and mobile responsiveness
- **Competitive Pricing**: Attractive price point leveraging automation efficiencies
- **Feature Innovation**: Advanced capabilities current platforms lack or execute poorly

The market shows clear willingness to pay CHF 15-50/month, creating opportunity for a well-executed competitor to gain significant market share with differentiated value proposition.

### Business Moat & Competitive Edge

**Our Differentiation Strategy:**

- **LLM-Powered Intelligence**: Advanced natural language processing for German auction text parsing, enabling higher accuracy property classification and value extraction than traditional scraping approaches
- **Multi-Source Data Integration**: Combining SHAB data with aerial imagery, GIS information, and Kataster zoning data to provide richer property context than competitors focused solely on auction basics
- **Real-Time Processing**: Daily synchronization capabilities providing faster updates and opportunity discovery than competitors with less frequent refresh cycles
- **Swiss-Optimized Experience**: Purpose-built filtering for Swiss property types, value formatting (950k vs 1.25mio CHF), and geographic precision tailored to local investor needs

**Scalable Competitive Advantages:**

- **Technology-First Approach**: Automation-driven architecture reduces operational costs, enabling competitive pricing while maintaining higher margins
- **Data Quality Consistency**: Systematic processing ensures reliable property classification and reduces manual error rates
- **Platform Extensibility**: Foundation designed for future expansion to additional data sources and European markets

### Monetization Strategy

**Business Model Validation:**

The Swiss auction aggregation market demonstrates clear willingness to pay, with existing competitors successfully charging CHF 15-50/month for subscription services. This validates both market demand and acceptable pricing ranges for automated auction intelligence platforms.

**Revenue Approach:**

- **Beta Strategy**: Free access during MVP phases to validate core value proposition and build user base
- **Paid Subscription Model**: Transition to paid-only service with trial period (no permanent free tier)
- **Competitive Positioning**: Leverage automation efficiencies to offer superior value at attractive price points
- **User Transition**: Grandfathering benefits for beta users to ensure smooth conversion to paid service

**Market Opportunity:**

With proven market demand at CHF 15-50/month pricing and technology-driven competitive advantages, the platform is positioned to capture significant market share in the Swiss auction aggregation space while maintaining sustainable unit economics through automation-first architecture.

---

## 3. Solution Snapshot

Auctiondeal is an AI-powered Swiss auction discovery platform that transforms SHAB's unfiltered foreclosure listings into actionable investment opportunities. It helps property investors and small real estate firms efficiently discover, evaluate, and focus on the right properties through intelligent filtering, interactive map exploration, and enriched data including location ratings, property assessments, aerial imagery, and GIS intelligence. By automating the research process and surfacing the best deals tailored to each investor's criteria, the platform saves hours of manual work while helping users identify high-potential opportunities they might otherwise miss.

---

## 4. Personas / Target Users

_Note: These personas are based on assumptions and limited market analysis. Further user research and validation is needed to refine user profiles and validate motivations._

### Persona 1: Casual Private Investor

- **Primary Goal**: Buy-to-let investment opportunities
- **Geographic Focus**: Home bias - focuses on familiar regions within reasonable distance
- **Investment Approach**: Seeks value deals for rental property portfolio building

### Persona 2: Personal Property Buyer

- **Primary Goal**: Find home or flat for personal residence
- **Geographic Focus**: Strong home bias - specific areas where they want to live
- **Investment Approach**: One-time or occasional buyers seeking below-market opportunities

### Persona 3: SME Real Estate Professional

- **Primary Goal**: Business opportunities for 1-10 person realtor or development firms
- **Geographic Focus**: Territory-based approach within operational regions
- **Investment Approach**: Portfolio approach across multiple opportunities and property types

**Common Characteristics:**

- All segments exhibit geographic "home bias" - preference for familiar regions
- Price sensitivity and value-seeking behavior across all user types
- Need for efficient filtering to match their specific criteria and constraints

**Research Gaps & Validation Needed:**

- Detailed user interviews to validate motivations and behaviors
- Geographic preference patterns and decision-making criteria
- Technology adoption patterns and feature prioritization
- Pricing sensitivity and willingness to pay validation

---

## 5. Critical User Journeys (CUJs)

### CUJ-1: Discover Investment Properties on Map (Desktop)

**Persona**: Casual Private Investor  
**Goal**: Find buy-to-let opportunities in familiar region using visual exploration.

**Steps**:

1. **Arrives via Google Ads** - searches "Zwangsversteigerungen" on Google, clicks ad to reach homepage
2. **Zooms to familiar area** - uses map controls to zoom into regions they know well (home bias)
3. **Applies basic filters** - selects "Wohnung" and/or "Einfamilienhaus", sets upper price range limit
4. **Explores multiple properties** - browses different auction objects using card previews and detail views
5. **Evaluates opportunities** - compares properties within their familiar geographic area for investment potential

**Supported Features**: Map Interface, Filtering (property type, price), Property Detail Pages  
**Success Criteria**: Geographic zoom engagement, filter usage for property type/price, multiple property comparison behavior

### CUJ-2: Find Personal Residence (Mobile)

**Persona**: Personal Property Buyer  
**Goal**: Discover potential homes in specific area during commute/casual browsing.

**Steps**:

1. **Opens Auctiondeal on mobile device**, sees local map view
2. **Zooms to home territory** - focuses on specific municipalities where they want to live
3. **Applies filters**: property type = EFH/Wohnung, specific municipalities
4. **Taps pins** to see property previews
5. **Views detailed information** for interesting properties

**Supported Features**: Mobile Web Interface, Touch Interactions, Property Details  
**Success Criteria**: 70% mobile filter usage, 30% property detail engagement

_Future Consideration: Guided onboarding flow to first capture location/area with range, then property categories, before showing filtered map results_

### CUJ-3: Territory Monitoring for Business (Desktop)

**Persona**: SME Real Estate Professional  
**Goal**: Systematically monitor territories for business opportunities.

**Steps**:

1. **Opens platform with remembered settings** - system recalls zoom level and filters from last visit
2. **Reviews new listings** since last visit using list view
3. **Cross-references map pins** with existing portfolio/knowledge
4. **Analyzes multiple properties** for potential business opportunities
5. **Shares promising leads** with team members for follow-up

**Supported Features**: Browser Session Memory (zoom/filters), List View, Filtering  
**Success Criteria**: 80% return usage, 50% list view engagement, session continuity

_Future Features: Saved Searches, Share/Export functionality, Data Export capabilities_

---

## 6. Solution Overview

**High-level view of how Auctiondeal works and delivers value to Swiss property investors.**

### Core Components:

**MVP Components:**

1. **SHAB Data Pipeline** – Automated daily synchronization with Swiss Commercial Gazette XML API, LLM-powered parsing of German auction text for property classification and value extraction
2. **Interactive Map Interface** – Switzerland-wide map with color-coded property pins, zoom controls, hover previews, and geographic filtering optimized for Swiss territories
3. **Filtering System** – Swiss-optimized filters for property types (Wohnung, EFH, MFH, etc.), price ranges (CHF formatting), and geographic regions/municipalities
4. **Property Detail Pages** – Comprehensive auction information with legal details, timelines, property specifics, and contextual intelligence

**Phase 2 Components:** 5. **Email Alert System (Phase 2)** – Automated notifications for saved search criteria and new matching properties

**Future Components:** 6. **Subscription Management (Future)** – User accounts, billing system, trial periods, subscription tiers 7. **Property Intelligence (Future)** – Advanced data enrichment including location ratings, property assessments, aerial imagery, GIS integration, and third-party valuations

### Architecture Overview:

- **Data Layer**: SHAB XML ingestion → LLM processing → structured database storage
- **Application Layer**: Web-based platform with responsive design for desktop and mobile
- **User Interface**: Map and list centric experience with integrated filtering, mobile and desktop optimized
- **Future Enhancements**: User accounts, saved searches, email alerts, advanced data enrichment

### Value Delivery:

Converts SHAB's raw auction listings into filtered, searchable property data with automated alerts and property intelligence from multiple data sources. Users save time on manual research and make better investment decisions through comprehensive property information and geographic search capabilities.

---

## 7. Implementation Roadmap

**Phased delivery plan with key features and success metrics.**

### Phase 1: MVP/Beta 1 (30 days)

- **Features**: SHAB data integration, interactive map interface, filtering system, property detail pages (desktop and mobile optimized)
- **Goal**: Validate core value proposition and usage patterns
- **Main KPI**: Monthly Active Users (unique)
- **Sub-KPIs**: Geographic zoom engagement, filter usage rates, property detail page views

### Phase 2: MVP/Beta 2 (+2 months)

- **Features**: Mandatory user registration (free), email alert system for saved searches, browser session memory for filters/zoom
- **Goal**: User acquisition and retention validation
- **Main KPI**: Monthly Active Signed-in Users
- **Sub-KPIs**: Registration conversion rates, email alert subscription rates, return user engagement

### Phase 3: Paid Subscription (+2 months)

- **Features**: Transition to paid-only service with trial period, subscription management system
- **Special**: Grandfathering discounts for existing beta users
- **Goal**: Revenue generation and conversion validation
- **Main KPI**: Monthly Paid Users
- **Sub-KPIs**: % of trial conversions to paid, active email alerts

### Phase 4: Advanced Features (+3 months)

- **Features**: Property Intelligence system (GIS integration, aerial imagery, location ratings, property assessments)
- **Goal**: Expand value proposition and increase ARPU
- **KPIs**: Advanced feature adoption rates, user retention improvement, pricing tier upgrades

### Future Phases

- **Enhanced Sharing**: Property sharing and export capabilities
- **Crowd-sourced Intelligence**: Local photos and user-contributed property insights
- **International Expansion**: Extension to other European foreclosure markets

---

## 8. Feature List & User Stories

**Group user stories under major feature areas.**

### Feature Area 1: SHAB Data Pipeline

**Purpose**: Aggregate and structure SHAB foreclosure listings for user consumption.

**User Stories:**

**Story 1.1: Initial Database Setup**
- As a **system**, I want to perform initial database schema setup with relationship constraints during first deployment, so that data integrity is maintained from launch and all auction data relationships are properly structured

***AC:***
- Database schema created with tables: auctions, objects, shab_publications
- Foreign key constraints established between tables
- Indexes created for performance optimization  
- Data validation rules implemented

---

**Story 1.2: Historical Data Backfill**
- As a **system**, I want to retrieve and process the last 90 days of auction publications during initial deployment, so that users have meaningful historical data to explore immediately upon launch

***AC:***
- 90 days of historical auction data available at launch
- All historical records properly parsed and structured
- Data quality validation completed
- Raw data preserved for future reprocessing
- Avoids duplicates in data (meta id)

---

**Story 1.3: Daily SHAB API Synchronization**
- As a **system**, I want to fetch daily SHAB publications, so that new auction announcements are available to users without delay

***AC:***
- Daily automated synchronization with SHAB API
- New auction listings appear within 2 hours of publication (normally 16:00 weekdays)
- System handles API failures gracefully
- Avoids duplicates in data (meta id)

---

**Story 1.4: LLM-Powered Property Classification**
- As a **system**, I want to parse German auction text using LLM processing to extract property type, estimated value, and location, so that users can filter and search effectively

***AC:***
- 95%+ accuracy in property type classification (Wohnung, EFH, MFH, Commercial, etc.)
- Estimated value extraction from auction obeject
- Property location identification and standardization (geolocation service)
- Confidence scoring for extracted data


---

**Story 1.5: Auction Status Monitoring**
- As a **system**, I want to monitor auction status changes (published/cancelled), so that users have current accurate information

***AC:***
- Detection of status changes from published to cancelled
- Automatic updates to auction listings
- Historical status tracking for audit purposes
- User-visible status indicators on properties

### Feature Area 2: Interactive Map Interface

**Purpose**: Enable visual exploration of auction properties with geographic context.

**User Stories:**

**Story 2.1: Switzerland Map with Property Pins**
- As a **user**, I want to see Switzerland map with color-coded property pins, so that I can visually explore auction locations

***AC:***
- Switzerland map as default view with appropriate zoom level
- Color-coded pins by property type (Land=Green, MFH=Blue, EFH=Light blue, Commercial=Violet, Wohnung=Orange, Parking=White, Misc=Yellow)
- Pin clustering for dense areas with zoom-in behavior when clicked on clustered pins
- Responsive map interface for desktop and mobile

---

**Story 2.2: Property Pin Interactions**
- As a **user**, I want to hover over pins (desktop) or tap pins (mobile) to preview auction details, so that I can quickly assess opportunities

***AC:***
- Desktop hover shows property preview cards with key details
- Mobile tap interactions display property information
- Preview includes property type, estimated value, and location
- Click/tap on pin opens full property detail page

---

**Story 2.3: Map Navigation and Zoom**
- As a **user**, I want to zoom into specific regions and have pins adapt appropriately, so that I can focus on my areas of interest

***AC:***
- Zoom controls for map navigation
- Pan functionality for exploring different areas
- Pin clustering adapts to zoom level
- Smooth zoom transitions and responsive controls

### Feature Area 3: Property Filtering System

**Purpose**: Allow users to narrow down auction results based on their specific criteria.

**User Stories:**

**Story 3.1: Property Type Filtering**
- As a **user**, I want to filter properties by type, so that I only see relevant opportunities

***AC:***
- Swiss property type taxonomy: Land, MFH, EFH, Commercial, Wohnung, Parking, Misc
- Multi-select filtering capability
- Real-time map pin updates based on selected types
- Clear filter status display

---

**Story 3.2: Price Range Filtering**
- As a **user**, I want to set price range filters using Swiss CHF formatting, so that I can focus on my budget range

***AC:***
- Swiss CHF formatting (950k for under 1M, 1.25mio for over 1M)
- Dual-handle slider for min/max price selection
- Smart defaults based on visible auction range
- Include/exclude toggle for properties without estimated values

---

**Story 3.3: Geographic Filtering**
- As a **user**, I want to filter by canton, so that I can target my preferred regions

***AC:***
- Canton-level filtering options
- Multi-select capability for multiple cantons
- Real-time map updates based on geographic selection
- Clear indication of selected regions

---

**Story 3.4: Filter Session Memory**
- As a **user**, I want my filter settings remembered during my session, so that I don't have to re-enter them repeatedly

***AC:***
- Browser session storage of all filter states
- Filter persistence across page navigation
- Automatic restoration of filters on return visits within session
- Clear option to reset all filters

### Feature Area 4: Property Detail Pages

**Purpose**: Provide comprehensive auction information for investment decision-making.

**User Stories:**

**Story 4.1: Complete Auction Information Display**
- As a **user**, I want to view complete auction details (estimated value, legal information, auction dates), so that I can evaluate opportunities thoroughly

***AC:***
- Display estimated value with confidence indicators
- Show auction dates, times, and locations
- Present legal requirements and participation details
- Include property-specific information from auction text
- Priority data for mobile view: estimated value, auction date, property type, address

---

**Story 4.2: SEO-Friendly Property URLs**
- As a **user**, I want to find specific properties in searched locations from Google, so that I can discover relevant auctions through search engines

***AC:***
- SEO-friendly URL structure for each property
- Public property preview pages with basic information
- Meta tags and structured data for search engines  
- Login gate for detailed information and actions (implementation details deferred to later phase)

*Future Stories for Post-MVP Phases (TBD): Property Bookmarking, Property Sharing, Document Display, Detailed Property Images, Zoning Information, Municipal Info & Location Ratings*

### Feature Area 5: Results List View

**Purpose**: Synchronized list display of property cards showing all auctions visible in current map scope and matching active filters.

**User Stories:**

**Story 5.1: Map-Synchronized Property List**
- As a **user**, I want to see a list of properties that matches my current map view and filters, so that I can efficiently browse multiple properties

***AC:***
- Real-time synchronization with map viewport bounds
- List updates automatically when map pans or zooms
- Current scope indicator (e.g., "12 properties in current view")
- Property cards with key information display

---

**Story 5.2: Property Card Display**
- As a **user**, I want to scan property cards with key details, so that I can quickly compare multiple opportunities

***AC:***
- Property cards show address, estimated value, auction date, property type
- Swiss CHF formatting consistent with filters
- Color indicators matching map pin colors
- Click navigation to property detail pages

---

**Story 5.3: List Sorting and Layout**
- As a **user**, I want properties organized in a logical order, so that I can prioritize my review

***AC:***
- Default sorting by auction date (soonest first)
- Responsive card layout (grid on desktop, stack on mobile)
- Loading states during data updates
- Empty state messaging when no properties in viewport

---

## 9. Non-Functional Requirements

**Performance, compliance, and reliability requirements.**

### Analytics & Monitoring Platform
- **KPI Tracking**: Comprehensive analytics platform to measure Monthly Active Users, conversion funnels, and feature adoption rates
- **User Behavior Analytics**: Track geographic zoom patterns, filter usage rates, property detail engagement, and critical user journey completion
- **Performance Monitoring**: Real-time monitoring of map load times, API response times, and user experience metrics
- **Privacy Compliance**: Analytics implementation must be GDPR-compliant for Swiss/EU users with proper consent management

### Performance Requirements  
- **Map Load Time**: < 1 second initial map load (95th percentile)
- **Filter Response**: < 300ms response time for filter applications
- **Property Card Load**: < 500ms for list view updates
- **API Response**: < 200ms for SHAB data queries (cached)
- **API Synchronization**: Daily SHAB data updates completed by 6 PM CET
- **Mobile Responsiveness**: Touch-friendly interface supporting iOS Safari and Android Chrome

### Data & Compliance
- **Data Retention**: TBD - Complete SHAB XML storage requirements
- **GDPR Compliance**: TBD - Privacy requirements for Swiss/EU users
- **Availability**: TBD - Uptime targets and SLA requirements  
- **Backup & Recovery**: TBD - Backup strategy and retention policies

### SEO & Discoverability
- **SEO-Friendly URLs**: Structured URLs for property pages to support search engine indexing  
- **Meta Tags**: Proper meta descriptions and structured data for property listings
- **Page Load Speed**: Core Web Vitals compliance for search ranking optimization

### Platform Architecture
- **Internationalization Framework**: Platform designed for future multi-language support without major refactoring

---

## 10. Out of Scope

**Clarify what's intentionally not included in this phase.**

### MVP Exclusions
- **No Bidding Integration**: Information-only platform, no auction participation or bidding functionality
- **No User-Generated Content**: No reviews, comments, or user-contributed property information
- **No Multi-Property Parsing**: MVP processes only primary property per auction, complex multi-object auctions handled simply
- **No User Accounts**: No registration, login, or personal accounts in MVP phase
- **No Payment Processing**: No subscription billing or payment handling in MVP

### Post-MVP Features (Explicitly Deferred)
- **Email Alert System**: Saved searches and automated notifications (Phase 2)
- **Property Bookmarking**: Personal favorites and property tracking (Phase 2+)
- **Property Sharing**: Semi-public sharing links and collaboration features (Phase 3+)
- **Advanced Property Intelligence**: Detailed images, documents, zoning info, municipal ratings (Phase 4+)
- **Data Export**: CSV/PDF export functionality (Phase 3+)
- **Multi-Language Support**: Interface localization for German, French, Italian, English (Future phases)

### Platform Limitations
- **Swiss Market Only**: No international auction markets in initial scope
- **SHAB Data Source Only**: No integration with cantonal or municipal auction sources
- **Single Language**: German/Swiss German primary, but platform architecture prepared for future multi-language expansion
- **Desktop-First Development**: Mobile optimization secondary to desktop experience

---

## 11. Risks & Open Questions

**Known uncertainties and dependencies that could impact project success.**

### Technical Risks

**Risk 1: SHAB API Dependency**
- **Issue**: What if SHAB API format changes or becomes unavailable?
- **Impact**: Single point of failure for core data source - could break entire platform
- **Mitigation**: TBD - Need backup data sources and rapid adaptation capability

**Risk 2: LLM Classification Accuracy**
- **Issue**: How reliable is 95%+ accuracy target for German legal auction text parsing?
- **Impact**: Core value proposition depends on accurate property classification and value extraction
- **Mitigation**: TBD - Need extensive testing with real SHAB data and fallback classification methods

**Risk 3: Performance at Scale**
- **Issue**: Can platform maintain < 1s map loads and < 300ms filter responses with large datasets and concurrent users?
- **Impact**: Poor performance could drive users away to faster competitors
- **Mitigation**: TBD - Need load testing and performance optimization strategy

### Business Model Risks

**Risk 4: User Adoption**
- **Issue**: Will Swiss property investors adopt new platform vs. established competitors they already know?
- **Impact**: Without user adoption, entire business model fails regardless of technical quality
- **Mitigation**: TBD - Need user research and targeted marketing to validate value proposition

**Risk 5: Trial-to-Paid Conversion**
- **Issue**: Will anonymous users create accounts for trial, and how many will convert to paid subscriptions?
- **Impact**: Low trial signup rates or poor trial-to-paid conversion could make revenue targets unachievable
- **Mitigation**: TBD - Need compelling trial value and smooth conversion funnel optimization

**Risk 6: Market Size Validation**
- **Issue**: Are there sufficient Swiss property investors to support growth targets (300+ paid users within 6 months)?
- **Impact**: Limited market size could cap growth potential and revenue targets
- **Mitigation**: TBD - Need market research to validate addressable market size and customer segments

### Open Questions Requiring Research

**Question 1: User Persona Validation**
- **Issue**: Current personas are assumption-based - need real user interviews to validate motivations and behaviors
- **Research Needed**: Visit actual Swiss foreclosure auctions and talk to participants on-site to understand real user needs, behaviors, and pain points

**Question 2: SEO vs Login Strategy**
- **Issue**: How to balance public property pages for SEO discoverability with login requirements for detailed information?
- **Research Needed**: Define optimal content gating strategy that maximizes search visibility while protecting premium content value

**Question 3: Data Licensing (Low Priority)**
- **Issue**: Future data sources beyond SHAB may require licensing (aerial imagery, GIS, third-party property data)
- **Research Needed**: Legal due diligence on data licensing for post-MVP features only - not immediate priority

**Question 4: GDPR Compliance Requirements**
- **Issue**: What are specific GDPR requirements for processing and storing Swiss auction data and user analytics?
- **Research Needed**: Legal consultation on data privacy compliance for Swiss/EU users, cookie consent, and analytics implementation

---

## 12. Appendices & Links

### Technical Documentation
- **System Architecture**: See `docs/auctiondeal_architecture.md` for complete technical specifications
- **SHAB API Interface**: See `docs/shab-api-interface.md` for Swiss Commercial Gazette API documentation
- **Database Schema**: 3-table structure (auctions, objects, shab_publications) with relationship definitions
- **Sample XML Structure**: `context/SB01-0000004345.xml` and `context/SB01-0000004347.xml` for development reference

### Decision Tracking
- **PRD Decision Log**: See `docs/auctiondeal_decisions.md` for comprehensive decision history and session progress

### Market Research
- **Market Study**: See `docs/marktstudie.md` for comprehensive Swiss foreclosure market analysis

### Future Reference Items
- **Property Categories**: Land (Green), MFH (Blue), EFH (Light Blue), Commercial (Violet), Wohnung (Orange), Parking (White), Misc (Yellow)
- **Swiss Value Formatting**: Under 1M shows "950k", over 1M shows "1.25mio"
- **Future User Stories**: Property Bookmarking, Property Sharing, Document Display, Detailed Images, Zoning Info, Municipal Ratings, Multi-Language Support

### External Resources
- **Swiss Commercial Gazette (SHAB)**: Official government auction publication source
- **Competitor Analysis**: AuctionHome, Local Auction, Zwangsversteigerung.ch (CHF 15-50/month market validation)

---
