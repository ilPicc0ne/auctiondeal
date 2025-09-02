# Auctiondeal PRD - Comprehensive Specification

## 1. Problem Definition & Strategic Context

### Problem Statement

**Core User Pain Point**: Swiss auction seekers cannot efficiently discover relevant opportunities in their area or gain information advantage over other buyers due to SHAB's limited, unfiltered text-only format and fragmented supplementary sources.

**Specific Pain Points**:

- **Discovery Problem**: SHAB.ch provides all auction data but as unfiltered text objects without property type, location radius, or other critical filters
- **Information Disadvantage**: Limited auction details force manual research across inconsistent cantonal/municipal sites (e.g., betreibungsamt-ag.ch has rich data, others barely functional)
- **Notification Gap**: No systematic way to get alerted about relevant opportunities (e.g., "multi-family homes within 30km of my location")
- **Research Inefficiency**: Each interesting auction requires manual investigation across multiple sources to gather competitive intelligence

**Impact on Target Users**:

- Individual investors miss opportunities in their criteria due to inability to filter SHAB's data stream
- Small real estate firms cannot efficiently monitor territories without manual daily screening
- Information asymmetry favors buyers with dedicated research resources or local insider knowledge

### Strategic Context

**Market Opportunity**:

- **Market Inefficiency**: Existing solutions (CHF 15-50/month) serve market demand but rely on manual processes, creating opportunity for automated, feature-rich alternative
- **Target Addressable Market**: Swiss individual property investors and small real estate firms (2-10 employees) currently underserved by expensive professional tools
- **Market Validation**: Competitor existence at CHF 15-50/month price points demonstrates willingness to pay for auction aggregation services
- **Growth Opportunity**: Automation advantage enables competitive pricing while delivering superior filtering and data enrichment capabilities

**Business Driver**:

- **Immediate**: Capture market share from existing manual-process competitors through automation advantage
- **Long-term**: Scalable technology platform enables expansion to other European foreclosure markets with minimal adaptation
- **Competitive Moat**: LLM-powered data enrichment and advanced filtering create differentiation that manual competitors cannot easily replicate

**User Research Insights**: Based on comprehensive 90-page Swiss auction market analysis:

- SHAB serves as mandatory central publication but lacks filtering capabilities
- Existing aggregators validate market demand but have scalability constraints due to manual processes
- Geographic filtering and proximity alerts exist in current solutions but can be significantly improved
- Information enrichment (GIS, imagery, zoning) provides competitive advantage opportunity

**Competitive Analysis**:

- **Existing Aggregators**: AuctionHome, Local Auction, Dein-ImmoCenter, Zwangsversteigerung.ch (CHF 15-50/month)
- **Current Limitations**: Manual data collection processes, limited filtering capabilities, high maintenance overhead
- **Market Gap**: Competitors rely on manual labor and are "proud" of human curation, creating scalability constraints
- **Our Opportunity**: LLM-powered automation enables richer data processing, advanced filtering, and scalable expansion to other countries with minimal adaptation
- **Technical Advantage**:
  - Fully automated pipeline vs. manual processes allows superior user experience at competitive pricing
  - Advanced scraping enables content enrichment from multiple sources: aerial imagery, street-view, GIS data, Kataster (building zones), providing superior value proposition
  - **Potential Future Extension**: Crowdsourced property inspection network could provide on-site visuals, but not core to initial differentiation strategy

### Success Hypothesis

**MVP Success Hypothesis** (30 days to launch):

If we provide centralized access to all Swiss foreclosure auctions with intuitive map-based filtering, supported by targeted marketing (Google Ads, FB Ads), we will achieve:

- 100+ unique visitors in month 1 post-launch
- 20% return visitor rate within 30 days
- 40% of users navigate beyond homepage
- 25% actively use core features (map interaction or filtering)

This validates core value proposition and user engagement patterns before implementing subscription monetization.

**Beta Registration Phase** (Month 2-3):

Building on MVP validation, if we implement user registration while keeping all features free, we will achieve:

- 60% of active users convert to registered beta users
- 500+ registered beta users by Month 3
- 40% weekly active user rate among registered users
- Foundation user database for Phase 1 conversion

**Phase 1 Success Hypothesis** (Freemium Subscription Launch):

Building on beta user base, if we implement freemium model with 7-day trial and annual discount options, we will achieve:

- **300 paid subscribers within first 6 months** of subscription launch
- **1,000 paid subscribers within 18 months** of subscription launch
- 15% trial-to-paid conversion rate from 7-day free trial
- CHF 13-17 average monthly subscription revenue per user (accounting for annual discount)
- 85% monthly subscriber retention rate
- 30% annual subscription adoption rate (20% discount incentive)

This validates sustainable monetization through strategic conversion funnel and justifies expanded feature development and market expansion.

## 2. Solution Architecture & Scope

### Solution Overview

**Product Concept**: A fully automated Swiss auction aggregation platform that scrapes SHAB XML data daily, processes and structures foreclosure auction information, and presents opportunities through an intuitive map-based interface with intelligent filtering capabilities.

**Key Value Proposition**: Users get comprehensive auction intelligence in one place - eliminating manual research across fragmented SHAB text data and inconsistent cantonal sites - with automated processing and superior filtering at competitive pricing.

**Technical Approach**:

- SHAB XML API integration for legal data compliance and completeness
- Real-time data processing with duplicate detection algorithms
- Interactive Swiss map visualization with property pins
- Progressive web application optimized for mobile and desktop research workflows

### Core Features (MVP)

#### Mainpage Architecture

The Auctiondeal platform consists of four integrated components that work together to provide comprehensive auction discovery and analysis:

1. **Filters** - Restrict the scope of map pins and list results through targeted search criteria
2. **Interactive Map** - Visual exploration with color-coded property pins and geographical context
3. **Results List** - Synchronized list view showing property cards for current map scope and active filters
4. **Property Detail Page** - Comprehensive property information accessed by clicking on map pins or result cards

#### Feature Implementation

**Feature Area 1: Data Collection & Processing**

- **Purpose:** Automated SHAB XML ingestion and parsing for structured property data
- **User Stories:**
  - As a **system**, I want to fetch daily SHAB XML publications via API using `publicationDate` and `subRubrics=SB01` filters, so that no foreclosure auction announcements are missed
  - As a **system**, I want to parse `auctionObjects` HTML content to extract property address, estimated value ("Rechtskräftige Betreibungsamtliche Schätzung: CHF X"), and property details, so that users can search and filter effectively
  - As a **system**, I want to extract the first/primary property from `auctionObjects` for MVP, so that complex multi-object auctions are handled simply initially
  - As a **system**, I want to store complete raw XML linked to auction objects using `publicationNumber` as identifier, so that multiple XML versions (original, cancellations, updates) are preserved
  - As a **system**, I want to detect duplicate auctions using `publicationNumber` matching, so that users see clean, non-redundant listings
  - As a **system**, I want to monitor `publicationState` changes from PUBLISHED to CANCELLED, so that users have current accurate information
- **Acceptance Criteria:**
  - Daily automated SHAB API calls with error handling and retry logic
  - HTML parsing of `auctionObjects` extracts: property address, estimated value (CHF amount), property type/details
  - Duplicate prevention using `publicationNumber` as unique key
  - Raw XML storage with auction object linking for future reprocessing
  - Status updates reflected within 24 hours
- **Future Enhancement:** Parse multiple properties within single `auctionObjects` element
- **Priority:** P0 (MVP required)

**Feature Area 2: Interactive Map Interface**

- **Purpose:** Visual exploration and geographical context for Swiss property auctions with filter integration

- **User Stories:**

  - As a **private investor**, I want to see all current auctions displayed as color-coded pins on a Swiss map that updates based on my active filters, so that I can quickly identify opportunities in specific regions within my criteria

- **Acceptance Criteria:**
  - **Map Technology**: OpenStreetMap integration for cost-effective, customizable mapping
  - **Filter Integration**: Map pins dynamically show/hide based on active filters (see Feature Area 3 user stories)
  - **Color-coded Property Pins**:
    - **Land** (Green pins)
    - **Mehrfamilienhaus (MFH)** (Blue pins)
    - **Single home (EFH)** (Light blue pins)
    - **Commercial** (Violet pins)
    - **Various** (Yellow pins)
    - **Parking/Garage** (White pins)
  - **Desktop Pin Interaction**: Hover displays property card with basic info (address, estimated value, auction date) - click on card navigates to detail page
  - **Mobile Pin Interaction**: No hover - direct click on single-property pin navigates to detail page
  - **Multi-Object Pin Behavior (Post-MVP)**: MVP processes only primary property per auction; future enhancement will handle multiple objects with zoom-in functionality
  - **Interactive Navigation**: Zoom, pan functionality for map exploration
  - **Swiss Geographic Focus**: Default view centers on Switzerland with appropriate zoom level
  - **Real-time Updates**: Map pins reflect current active filters and database updates
- **Technical Notes:**
  - OpenStreetMap API integration with custom pin styling
  - Pin color coordination with filter categories from Feature Area 3
  - Desktop hover cards with CSS-only or lightweight JavaScript implementation
  - Mobile touch detection to disable hover behaviors
  - Pin clustering logic for multi-object locations with zoom-in functionality
  - Real-time synchronization with filter state changes
  - Responsive design optimized for both desktop mouse and mobile touch interactions
- **Priority:** P0 (MVP required)

**Feature Area 3: Property Filtering System**

- **Purpose:** Efficient opportunity discovery through targeted search capabilities

- **User Stories:**

  - As a **private investor**, I want to filter auctions by estimated value range using Swiss-style formatting, so that I only see properties within my budget constraints

- **Acceptance Criteria:**
  - **Value range input**: Slider or dual input fields (min/max amounts)
  - **Swiss value formatting in slider:**
    - **Under 1 million**: "950k" (for CHF 950'000)
    - **Over 1 million**: "1.25mio" (for CHF 1'250'000)
    - **Exact values on hover/selection**: Show full CHF amount
  - **Dynamic filtering**: Real-time map pin and results list updates as user adjusts range
  - **Smart defaults**: Pre-populated ranges based on current visible auctions (e.g., 200k - 2mio)
  - **Mobile optimization**: Touch-friendly slider controls with readable Swiss formatting
  - **Data source**: Uses estimated values parsed from `auctionObjects` "Rechtskräftige Betreibungsamtliche Schätzung" text
  - **Fallback handling**: Properties without parsed estimated values show in "Unknown value" category with option to include/exclude
- **Technical Notes:**

  - Swiss formatting logic: < 1M = "XXXk", ≥ 1M = "X.XXmio"
  - Depends on LLM-powered value extraction from fuzzy `auctionObjects` text
  - Handle various currency formats and German phrasing variations
  - Real-time filtering without page reload
  - Preserve filter state during map interactions

  - As a **private investor**, I want to filter map pins by property type, so that I only see opportunities matching my investment focus

- **Acceptance Criteria (Property Type Filter):**
  - **Filter interface**: Checkbox list or dropdown with 6 main property categories:
    - **Land** (Green pins)
    - **Mehrfamilienhaus (MFH)** (Blue pins)
    - **Single home (EFH)** (Light blue pins)
    - **Commercial** (Violet pins)
    - **Various** (Yellow pins)
    - **Parking/Garage** (White pins)
  - **Real-time map filtering**: Show/hide pins based on selected property types
  - **Visual feedback**: Filtered pin categories remain color-coded, unselected types hidden
  - **Select all/none**: Quick toggle options for all categories
  - **Mobile optimization**: Touch-friendly checkboxes with readable labels
  - **Data source**: Property type classification from LLM analysis of `auctionObjects` descriptions
  - **Fallback handling**: Unclassified properties show in "Various" category
- **Technical Notes (Property Type Filter):**
  - Depends on LLM-powered property type classification from German descriptions
  - Filter state persists during map interactions and value range changes
  - Combined filtering with value range (AND logic)
  - Pin color coding matches filter categories
- **Priority:** P0 (MVP required)

**Feature Area 4: Results List View**

- **Purpose:** Synchronized list display of property cards showing all auctions visible in current map scope and matching active filters

- **User Stories:**

  - As a **private investor**, I want to see a scrollable list of property cards showing all auctions currently visible on the map, so that I can browse detailed information without clicking each individual pin

- **Acceptance Criteria:**
  - **Synchronization**: List shows only properties that are currently visible in map viewport and match active filters
  - **Property Cards**: Each card displays key information:
    - Property address and type
    - Estimated value (Swiss formatting: "950k", "1.25mio")
    - Auction date and time
    - Property thumbnail/placeholder image
    - Color indicator matching map pin color
  - **Responsive Layout**: Cards adapt to screen size (grid on desktop, stack on mobile)
  - **Real-time Updates**: List updates immediately when map view changes or filters are applied
  - **Click Navigation**: Clicking on any property card navigates to detailed property page
  - **Loading States**: Clear visual feedback during data loading and updates
  - **Empty States**: Appropriate messaging when no properties match current filters/map view
- **Technical Notes:**
  - Real-time synchronization with map viewport bounds and filter state
  - Efficient rendering for large lists with virtualization if needed
  - Card layout optimized for both desktop and mobile viewing
  - Integration with Feature Area 5 for detail page navigation
  - Swiss value formatting consistency with filter controls
- **Priority:** P0 (MVP required)

**Feature Area 5: Property Detail Page**

- **Purpose:** Comprehensive property information and auction details for informed decision-making

- **User Stories:**

  - As a **private investor**, I want to view complete property details including auction logistics, financial information, and legal requirements, so that I can make informed bidding decisions

- **Acceptance Criteria:**
  - **Property Information Section**:
    - Full property description from `auctionObjects` (parsed and formatted)
    - Property address with aerial/street view integration
    - Property type, size (NWF), room count, features
    - Color-coded property type indicator (matching map pin colors)
  - **Financial Details Section**:
    - Estimated value prominently displayed (Swiss formatting)
    - Required deposit amount (from `additionalLegalRemedy` when available)
    - Payment requirements and banking details
  - **Auction Logistics Section**:
    - Auction date and time (from `auction/date`, `auction/time`)
    - Physical auction location (from `auction/location`)
    - Registration deadlines (from `registration/entryDeadline`)
    - Responsible enforcement office (from `registrationOffice`)
  - **Viewing Appointments Section** (when available):
    - Besichtigung details parsed from `remarks` field
    - Multiple viewing appointments formatted clearly
    - Contact information for viewing arrangements
  - **Legal Information Section**:
    - Circulation deadline (from `circulation/entryDeadline`)
    - Additional legal requirements (from `additionalLegalRemedy`)
    - Publication details and status
  - **Navigation & Actions**:
    - Return to map/list view maintaining filter state
    - Mobile-optimized layout with touch-friendly interactions
    - Shareable URL for individual properties
- **Technical Notes:**
  - LLM-powered parsing of unstructured German text in `auctionObjects` and `remarks`
  - Aerial view integration via mapping service APIs
  - Responsive design optimized for property research workflow
  - Fallback handling for missing or unparseable fields
  - Deep linking support with SEO-friendly URLs
- **Priority:** P0 (MVP required)

### Future Roadmap

**Phase 1: Monetization & Enhanced Filtering (Post-MVP)**

**3-Phase Monetization Progression:**

*Month 1: MVP Launch*
- Completely free access, no registration required
- Focus on user acquisition and engagement validation
- All current features available to anonymous users

*Month 2-3: Beta Registration Phase*
- Require email registration to access platform
- All features remain free for registered beta users
- Build user database and communication channel
- Target: 500+ registered beta users

*Month 4+: Freemium Subscription Launch*
- **Free Tier**: Basic map viewing and simple filtering
- **Premium Trial**: 7-day free trial of advanced features
- **Subscription Options**:
  - Monthly: CHF 15-20/month
  - Annual: CHF 144-192/year (20% discount = CHF 12-16/month effective)
- **Premium Features**:
  - Advanced notifications and saved search alerts
  - Granular filters (room counts, property size ranges, construction year)
  - Enhanced property data and document integration
  - Portfolio management with saved searches and watchlists
  - Export capabilities (PDF reports, CSV data)
  - Priority customer support

**Revenue & Conversion Targets:**
- 15% trial-to-paid conversion rate
- 30% annual subscription adoption rate
- 85% monthly subscriber retention rate
- 300 paid subscribers within 6 months of subscription launch
- 1,000 paid subscribers within 18 months of subscription launch

**Phase 2: Data Enrichment & Intelligence (6-12 months)**

- GIS integration for enhanced geographical analysis
- Kataster (building zones) data integration for zoning information
- Standortberichte integration (e.g., ZKB location reports) for market context
- Crowdsourced property inspection network (potential extension - individuals provide on-site visuals and condition reports)

**Phase 3: International Expansion (12+ months)**

- German market expansion (similar foreclosure systems)
- Austrian market adaptation
- Other European foreclosure markets with minimal technical adaptation
- Multi-language support (German, French, Italian, English)

## 3. User Context & Personas

### User Segmentation Overview

Auctiondeal serves two primary user segments in the Swiss foreclosure auction market:

1. **Individual Property Investors (80% of target users)**: Private investors seeking below-market opportunities
2. **Small Real Estate Firms (20% of target users)**: Professional firms with 2-10 employees monitoring territories

Both segments share common pain points around SHAB's unfiltered data and fragmented information sources, but differ in investment scale, frequency, and decision-making processes.

### Primary Persona: Individual Property Investor

**Name**: "Thomas the Territory Investor"

**Demographics**:
- Age: 38-55 years old
- Location: Urban/suburban Switzerland (Zurich, Basel, Bern areas)
- Income: CHF 120,000-200,000 annually
- Investment Capital: CHF 200,000-800,000 available for opportunities
- Language: German (primary), some French/Italian

**Professional Background**:
- Primary occupation: Corporate professional, entrepreneur, or successful tradesperson
- Real estate experience: 3-8 years of property investment
- Portfolio: Currently owns 1-3 investment properties
- Investment approach: Buy-and-hold rental properties, occasional renovation projects

**Goals & Motivations**:
- **Primary Goal**: Build passive income through rental property portfolio
- **Investment Strategy**: Target undervalued properties in familiar geographic areas (30-50km radius from home)
- **Risk Profile**: Moderate - willing to invest in properties requiring minor-to-moderate renovation
- **ROI Expectations**: 4-7% annual rental yield, 15-25% total return over 5-7 years
- **Time Commitment**: 2-5 hours weekly for deal research and property management

**Pain Points & Frustrations**:
- **Information Overload**: SHAB provides too much irrelevant data without filtering
- **Geographic Inefficiency**: Wastes time reviewing auctions outside investment radius
- **Research Time**: Manually investigating each property across multiple websites
- **Missed Opportunities**: Discovers attractive auctions too late or after viewing deadlines
- **Competitive Disadvantage**: Lacks market intelligence compared to professional investors

**Technology & Behavior Patterns**:
- **Device Usage**: 60% mobile (during commute, evening research), 40% desktop (weekend deep-dive analysis)
- **Research Habits**: Systematic weekly review sessions, opportunistic daily checks
- **Decision Timeline**: 2-14 days from discovery to auction attendance
- **Information Sources**: SHAB, Google Maps, cantonal websites, local real estate portals
- **Social Influence**: Seeks validation from investment communities, real estate forums

**Subscription Decision Factors**:
- **Value Threshold**: Must save 3+ hours weekly to justify CHF 15-20/month cost
- **Feature Priorities**: Geographic filtering, property type focus, viewing appointment alerts
- **Trial Behavior**: Conservative - thoroughly tests free features before upgrading
- **Payment Preference**: Annual subscription if convinced of long-term value (20% discount appeals)

### Secondary Persona: Small Real Estate Firm

**Name**: "Sandra's Smart Investments Ltd"

**Company Profile**:
- Team Size: 3-7 employees (owner + analysts/agents)
- Geographic Focus: 1-2 cantons, systematic territory coverage
- Investment Volume: CHF 2-10 million annually across multiple properties
- Business Model: Mix of buy-hold-rent and renovation-resale projects

**Professional Context**:
- **Role**: Investment analyst or firm owner making acquisition decisions
- **Experience**: 8-15 years in Swiss real estate market
- **Decision Authority**: Evaluates opportunities, presents to investment committee
- **Market Knowledge**: Deep understanding of local property values and rental markets

**Goals & Motivations**:
- **Systematic Coverage**: Monitor all foreclosure opportunities in territory
- **Competitive Intelligence**: Track market activity and pricing trends
- **Efficiency**: Maximize deal flow while minimizing research overhead
- **Risk Management**: Thorough due diligence before auction participation
- **Portfolio Growth**: Consistent deal sourcing for steady business expansion

**Pain Points & Frustrations**:
- **Manual Processes**: Current research workflow doesn't scale with volume
- **Team Coordination**: Difficult to track which properties each team member is investigating
- **Market Intelligence**: Lacks historical auction data for pricing analysis
- **Notification Delays**: May miss opportunities during team member absences
- **Documentation**: Tedious manual compilation of property research files

**Technology & Usage Patterns**:
- **Multi-user Access**: Team members need shared access to research and saved searches
- **Integration Needs**: Export data for internal CRM and analysis systems
- **Professional Requirements**: Detailed reporting capabilities for investment committees
- **Volume Processing**: Reviews 20-50 potential opportunities monthly
- **Response Speed**: Needs immediate alerts for high-priority property types

**Subscription Considerations**:
- **Business Expense**: CHF 15-20/month easily justified as business tool
- **Team Multiplier**: Value increases with multiple team members using platform
- **Professional Features**: Willing to pay premium for export, reporting, multi-user capabilities
- **Annual Commitment**: Likely to choose annual subscription for budget predictability
- **Upgrade Path**: Early candidate for higher-tier professional features in future

## 4. Critical User Journeys

[To be expanded - detailed user journeys with edge cases and failure scenarios]

## 5. Implementation & Success

[To be expanded - technical architecture, success metrics, and go-to-market strategy]
