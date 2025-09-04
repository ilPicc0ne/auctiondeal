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
- **Technical Advantage & Competitive Differentiation**:
  - **Automated Intelligence**: LLM-powered pipeline processes German auction text with 95%+ accuracy vs. competitors' manual data entry, enabling real-time updates and consistent quality at scale
  - **Superior Data Richness**: Multi-source integration (SHAB + aerial imagery + GIS + Kataster zoning + street view) provides 10x more property context than existing platforms limited to basic auction details
  - **Scalability Moat**: While competitors are constrained by manual labor costs, our automated architecture can expand to new cantons and countries with minimal incremental cost
  - **Real-Time Competitive Edge**: Daily SHAB synchronization vs. competitors' weekly manual updates gives users 3-7 day head start on new opportunities
  - **Advanced Filtering Capabilities**: Swiss-formatted value ranges, property type classification, and geographic filtering surpass competitors' basic search functionality

## 2. Solution Overview

### Core Value Proposition

**"Automated Swiss auction intelligence platform that transforms SHAB's unfiltered data into actionable investment opportunities through intelligent filtering and property enrichment."**

**Primary Value Drivers**:

- **Efficiency Gain**: Automated aggregation saves 3-5 hours weekly vs manual SHAB research
- **Information Advantage**: LLM-powered property intelligence provides competitive edge over manual processes
- **Geographic Focus**: Swiss-optimized filtering with canton-level precision and map-based discovery
- **Real-time Updates**: Daily synchronization provides 3-7 day head start vs competitors' weekly updates

### Solution Approach

#### High-Level Platform Architecture

**Core Components**:

1. **SHAB Data Pipeline**: Automated daily sync with Swiss Commercial Gazette API
2. **Intelligent Processing**: LLM-powered German text parsing for property classification and value extraction
3. **Map-Based Interface**: Interactive Swiss-focused map with color-coded property pins and real-time filtering
4. **Property Intelligence**: Enriched auction data with viewing appointments, estimated values, and geographic context

#### Key Capabilities

**MVP Foundation (30 days)**:

- **Automated Discovery**: All Swiss foreclosure auctions aggregated in single interface
- **Smart Filtering**: Property type, value range, canton-based geographic filtering
- **Map Visualization**: Interactive exploration with grouped pins and property cards
- **Mobile Optimization**: Touch-friendly interface for on-the-go opportunity assessment

**Growth Path (Phases 2-5)**:

- **User Engagement**: Free accounts with saved searches and email notifications
- **Monetization**: Premium subscription with advanced features and data export
- **Professional Tools**: Team collaboration, data enrichment, market analytics
- **International Expansion**: European foreclosure market extension

### Key features and implementation roadmap

**Overall North Star**: Monthly Paid Users

**Phase 1: MVP Beta (30 days)**

- **Key Features**: Map-based discovery, property filtering, mobile optimization
- **Focus KPI**: 100 monthly active users
- **Access**: Completely free, no registration required

**Phase 2: Free Accounts + Email Notifications (2 months after MVP)**

- **Key Features**: User registration, saved searches, email notifications for new matches
- **Focus KPI**: 60% conversion from anonymous to registered users
- **Access**: Free with registration required

**Phase 3: Paid Subscription Model (2 months after Free Accounts)**

- **Key Features**: Premium trial, advanced filters, data export, portfolio management
- **Focus KPI**: 20% free trial to paid subscriber conversion rate
- **Pricing**: CHF 15-20/month, CHF 144-192/year (20% discount)

**Phase 4: Advanced Features (4 months after Paid Subscription)**

- **Key Features**: Team collaboration, GIS integration, Kataster data, aerial imagery, market analytics
- **Focus KPI**: 60% retention rate
- **Target**: Professional users and small real estate firms

**Phase 5: International Expansion (12 months after Advanced Features)**

- **Key Features**: Multi-language support, German/Austrian markets, localized features
- **Focus KPI**: TBD
- **Scope**: European foreclosure market extension

## 3. User Context & Personas

### User Segmentation Overview

Auctiondeal serves two primary user segments in the Swiss foreclosure auction market:

1. **Individual Property Investors (80% of target users)**: Private investors seeking below-market opportunities
2. **Small Real Estate Firms (20% of target users)**: Professional firms with 2-10 employees monitoring territories

Both segments share common pain points around SHAB's unfiltered data and fragmented information sources, but differ in investment scale, frequency, and decision-making processes.

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

- **Purpose:** Efficient opportunity discovery through targeted search capabilities across property type, value, and location

- **User Story:**

  - As a **private investor**, I want to filter auction properties by category, value range, and location, so that I can quickly find investment opportunities matching my specific criteria

- **Acceptance Criteria:**

**Primary Filters (Priority Order):**

**1. Property Category Filter** _(Highest Priority)_

- **Interface**: Checkbox grid with 6 main categories matching map pin colors
- **Categories**: Land (Green), MFH (Blue), EFH (Light blue), Commercial (Violet), Various (Yellow), Parking/Garage (White)
- **Data Source**: LLM classification from German `auctionObjects` descriptions
- **Default**: All categories selected

**2. Value Range Filter** _(Second Priority)_

- **Interface**: Dual-handle slider with Swiss formatting display
- **Swiss Formatting**: Under 1M shows "950k", over 1M shows "1.25mio", exact CHF on hover
- **Smart Defaults**: Auto-populated based on visible auction range (e.g., 200k-2mio)
- **Data Source**: Estimated values from `auctionObjects` "Rechtskräftige Betreibungsamtliche Schätzung"
- **Fallback**: Properties without estimates show in "Unknown value" category with include/exclude toggle

**3. Location Filter** _(Third Priority)_

- **Interface**: Multi-select canton dropdown (Zurich, Basel, Bern, etc.)
- **Map Integration**: Bounds adjust to selected regions
- **Data Source**: Geocoded property addresses

**Supporting Filters:**

**4. Date Range**: Date picker with presets (next 30 days default)
**5. Text Search**: Live search across addresses and descriptions

- **System Behavior:**

  - **Real-time Updates**: Map and results update immediately on filter changes
  - **Filter Combination**: Uses AND logic (properties must match all active filters)
  - **State Persistence**: Settings maintained during navigation and refresh
  - **Mobile Optimization**: Touch-friendly controls with readable Swiss formatting

- **Implementation Notes:**

  - Can be developed as separate stories during implementation
  - Swiss formatting: < 1M = "XXXk", ≥ 1M = "X.XXmio"
  - LLM-powered value extraction and property classification required
  - Filter state stored in URL for shareable views

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

## 5. Solution Architecture & Scope

### CUJ-U1: Desktop Map Exploration

**Persona**: Thomas the Territory Investor (Individual Investor)
**Trigger**: User discovers Auctiondeal through Google Ads, clicks to homepage
**Goal**: Explore all available auctions using desktop interface to find investment opportunities

**Detailed Journey Steps**:

**1a. Landing & Initial Overview**

- **User Action**: Arrives on homepage, scans the interface
- **System Response**: Map loads centered on Switzerland showing all current auctions
- **Visual Elements**: Mix of colored single pins + grey grouped pins where multiple auctions exist
- **Pin Types**:
  - **Grey Grouped Pins**: Multiple properties at same/nearby locations (any combination of types)
  - **Colored Single Pins**: Individual properties (Green=Land, Blue=MFH, Light Blue=EFH, Violet=Commercial, Yellow=Various, White=Parking)
- **→ Feature Area 2**: Interactive map with Swiss geographic focus
- **⚠ New Story Needed**: Grey grouped pin visual system

**1b. Group Pin Zoom Interaction**

- **User Action**: Clicks on grey grouped pin showing "3 properties"
- **System Response**: Map automatically zooms in to reveal individual pins in that cluster
- **Zoom Behavior**: Smart zoom level to best show separated pins without overlapping
- **Alternative**: User can also use +/- zoom buttons for manual control
- **→ Feature Area 2**: Interactive navigation (zoom/pan functionality)
- **⚠ New Story Needed**: Group pin click-to-zoom functionality

**1c. Single Pin Hover Discovery**

- **User Action**: Hovers cursor over individual blue pin (MFH property)
- **System Response**: Property hover card appears showing:
  - Property address
  - Estimated value (Swiss format: "750k")
  - Auction date
  - Property type icon matching pin color
- **Card Position**: Smart positioning to avoid viewport edges
- **→ Feature Area 2**: Desktop hover interaction with property cards
- **⚠ Enhanced Story Needed**: Hover card system with smart positioning

**1d. Hover Card Interactions**

- **Scenario A - Card Click**: User clicks on hover card
  - **System Response**: Navigates to detailed property page
- **Scenario B - Other Pin Hover**: User moves cursor to different pin
  - **System Response**: Previous card closes, new card opens for new pin
- **Scenario C - Close Card**: User clicks X button or moves cursor away
  - **System Response**: Card closes, map returns to normal state
- **→ Feature Area 5**: Property detail page navigation
- **⚠ New Story Needed**: Multi-state hover card interaction management

**1e. Direct Detail Page Navigation**

- **User Action**: From hover card, clicks "View Details" or card area
- **System Response**: Opens comprehensive property detail page
- **Navigation Context**: Back button returns to map with same zoom/position preserved
- **→ Feature Area 5**: Navigation with context preservation
- **✓ Validates**: "Return to map/list view maintaining filter state"

**Success Metrics**: User engages with map interface (60% target), hover interactions (40% target), detail page navigation (25% target)

**Edge Cases & Failure Scenarios**:

- **Group Pin Loading**: Slow cluster calculation → Progressive pin rendering with loading states
- **Hover Card Positioning**: Card extends beyond viewport → Smart repositioning algorithm
- **Pin Overlap**: High density areas → Intelligent clustering with zoom thresholds
- **Navigation Context Loss**: Back button doesn't preserve state → URL state management

### CUJ-U2: Mobile Map Exploration

**Persona**: Thomas the Territory Investor (Individual Investor)
**Trigger**: User opens Auctiondeal on mobile device during commute or while on-the-go
**Goal**: Quickly explore auctions using touch interface to find nearby opportunities

**Detailed Journey Steps**:

**2a. Mobile Landing & Touch Interface**

- **User Action**: Opens site on mobile browser, sees mobile-optimized map
- **System Response**: Map loads with touch-friendly controls, same pin system as desktop
- **Visual Differences**: Larger pins for finger interaction, grouped pins show count badges
- **Touch Targets**: Minimum 44px tap areas for accessibility
- **→ Feature Area 2**: Mobile-optimized map interface
- **⚠ New Story Needed**: Mobile-optimized pin sizing and touch targets

**2b. Pinch Zoom & Group Pin Interaction**

- **User Action**: Pinch-zooms into region OR taps grey grouped pin
- **System Response**: Same zoom behavior as desktop but optimized for touch
- **Gesture Support**: Pinch-to-zoom, drag-to-pan, double-tap zoom
- **Group Pin Tap**: Automatic zoom-in to reveal individual pins (same as desktop click)
- **→ Feature Area 2**: Interactive navigation with touch gestures
- **⚠ Enhanced Story Needed**: Touch gesture support with group pin interaction

**2c. Direct Pin-to-Detail Navigation**

- **User Action**: Taps on individual colored pin (no hover available)
- **System Response**: Immediately navigates to property detail page (no intermediate card)
- **Loading State**: Brief loading indicator during navigation
- **No Hover Cards**: Mobile skips hover step entirely for faster interaction
- **→ Feature Area 2**: Mobile pin interaction (no hover, direct click)
- **✓ Validates**: "No hover - direct click on single-property pin navigates to detail page"

**2d. Mobile Detail Page Experience**

- **User Action**: Reviews property information on mobile-optimized layout
- **System Response**: Responsive design with touch-friendly navigation
- **Back Navigation**: Browser back OR dedicated back button returns to map
- **Context Preservation**: Map returns to same zoom/position as desktop
- **→ Feature Area 5**: Mobile-optimized layout with touch-friendly interactions
- **⚠ Enhanced Story Needed**: Mobile-optimized detail page layout

**Success Metrics**: Mobile engagement rate (50% target), direct navigation efficiency (faster than desktop hover flow)

**Edge Cases & Failure Scenarios**:

- **Touch Accuracy**: Pins too close together → Intelligent touch area expansion
- **Pinch Zoom Conflicts**: Map zoom vs browser zoom → Touch event handling
- **Slow Network**: Mobile data limitations → Progressive loading with offline caching
- **Small Screen Navigation**: Context loss on small screens → Persistent navigation breadcrumbs

### CUJ-U3: Filter-Driven Discovery

**Persona**: Thomas the Territory Investor (Individual Investor)
**Trigger**: User wants to narrow down auctions to specific criteria (property type, value range, location)
**Goal**: Use filtering system to efficiently find investment opportunities matching specific criteria

**Detailed Journey Steps**:

**3a. Filter Panel Discovery**

- **User Action**: Notices filter controls in left sidebar or mobile filter button
- **System Response**: Filter panel shows current state (all categories selected, full value range)
- **Visual Indicators**: Active filter count badge, current results count display
- **Default State**: All filters open to show maximum available auctions
- **→ Feature Area 3**: Property filtering system interface
- **⚠ New Story Needed**: Filter panel UI with results count feedback

**3b. Property Category Filtering**

- **User Action**: Unchecks "Land", "Commercial", "Parking" - keeps only "MFH", "EFH", "Various"
- **System Response**: Map pins update in real-time (only blue, light blue, yellow pins remain)
- **Results Update**: Counter shows "47 properties" instead of previous "127 properties"
- **List Sync**: Property list simultaneously updates to show only matching properties
- **→ Feature Area 3**: Property category filter with checkbox interface
- **✓ Validates**: Property category filter with real-time updates

**3c. Value Range Adjustment**

- **User Action**: Drags dual-handle slider from 200k-2mio to 400k-800k
- **System Response**: Swiss formatting shows "400k - 800k", further reduces visible pins
- **Live Feedback**: Results counter drops to "23 properties"
- **Smart Defaults**: Slider initially set to current visible property range
- **→ Feature Area 3**: Value range filter with Swiss formatting
- **✓ Validates**: Value range filter with Swiss formatting and real-time updates

**3d. Geographic Filtering**

- **User Action**: Selects "ZH" and "ZG" cantons from dropdown (using Swiss canton abbreviations)
- **System Response**: Map bounds adjust to selected regions, pins outside fade/hide
- **Results Refinement**: Final count shows "12 properties"
- **Map Integration**: Viewport automatically adjusts to show selected regions
- **→ Feature Area 3**: Location filter with multi-select canton dropdown
- **⚠ Enhanced Story Needed**: Canton-based geographic filtering with map integration using standard Swiss abbreviations (ZH, ZG, SG, etc.)

**3e. Filter State Persistence**

- **User Action**: Clicks on property detail, then returns to map
- **System Response**: All filters remain exactly as set (categories, value range, location)
- **URL State**: Filter settings reflected in URL for bookmarkable searches
- **Session Persistence**: Settings maintained across browser refresh
- **→ Feature Area 3**: Filter state persistence during navigation
- **✓ Validates**: "Settings maintained during navigation and refresh"

**Success Metrics**: Filter usage rate (60% of users), multi-filter combinations (40%), filter-to-detail conversion (35%)

**Edge Cases & Failure Scenarios**:

- **No Results**: Overly restrictive filters → Suggest filter relaxation with specific recommendations
- **Filter Conflicts**: Contradictory filter combinations → Intelligent conflict resolution
- **Performance**: Large dataset filtering → Debounced updates with loading indicators
- **Mobile Filter UI**: Limited screen space → Collapsible filter sections with priority ordering

### CUJ-U4: List-Based Exploration

**Persona**: Thomas the Territory Investor (Individual Investor)
**Trigger**: User wants to browse property details in list format while maintaining map context
**Goal**: Use synchronized list view to efficiently compare multiple properties matching current filters and map viewport

**Detailed Journey Steps**:

**4a. List Discovery & Map-List Synchronization**

- **User Action**: Scrolls down or notices property list below/beside map
- **System Response**: List shows only properties currently visible in map viewport and matching active filters
- **Sync Behavior**: List updates automatically when user pans map or changes zoom level
- **Current Scope**: Shows "12 properties in current view" with applied filters (MFH/EFH/Various, 400k-800k, ZH/ZG)
- **→ Feature Area 4**: Synchronized list display with map viewport
- **⚠ Enhanced Story Needed**: Viewport-synchronized property list with scope indicators

**4b. Property Card Scanning**

- **User Action**: Scans through property cards in list view
- **Card Content**: Each card shows address, estimated value (Swiss format), auction date, property type icon
- **Visual Consistency**: Property type colors match map pin colors (blue for MFH, etc.)
- **Sorting**: Properties ordered by auction date (soonest first) or estimated value
- **→ Feature Area 4**: Property cards with key information display
- **✓ Validates**: "Each card displays key information" with color indicators matching map pins

**4c. Direct Card-to-Detail Navigation**

- **User Action**: Clicks on property card for CHF 650k MFH in Winterthur
- **System Response**: Navigates directly to detailed property page
- **Context Preservation**: Back navigation returns to same map view and list position
- **Loading State**: Brief transition indicator during page load
- **→ Feature Area 4**: Click navigation to detailed property page
- **✓ Validates**: "Clicking on any property card navigates to detailed property page"

**4d. List-Map Interaction**

- **User Action**: Returns to map/list view, pans map to different area
- **System Response**: List immediately updates to show properties in new viewport
- **Dynamic Updates**: Real-time synchronization without page reload
- **Scroll Position**: List resets to top when map viewport changes significantly
- **→ Feature Area 4**: Real-time synchronization with map viewport bounds
- **⚠ New Story Needed**: Bidirectional map-list synchronization with scroll management

**Success Metrics**: List usage rate (70% of users), list-to-detail conversion (45%), map-list interaction patterns

**Edge Cases & Failure Scenarios**:

- **Large Viewport**: Too many properties for list → Pagination or virtualization with performance optimization
- **Empty Viewport**: User zooms to area with no properties → Clear messaging with nearby suggestions
- **Slow Synchronization**: Network delays during updates → Loading states with skeleton UI
- **Mobile List Layout**: Limited screen space → Collapsible map with expandable list view

### System Journeys

#### CUJ-S1: Initial Platform Setup & Data Bootstrap

**Trigger**: First deployment to production environment with empty database
**Goal**: Establish reliable data pipeline and populate initial auction dataset
**Scope**: MVP System Requirements

**System Journey Steps**:

**S1a. SHAB API Connection & Validation**

- **Process**: Establish secure connection to Swiss Commercial Gazette API
- **Validation**: Verify API credentials, rate limits, data format consistency
- **Error Handling**: Connection failures, authentication issues, API changes
- **⚠ Missing System Story**: SHAB API integration with monitoring and failover

**S1b. Database Schema Initialization**

- **Process**: Create 3-table schema (auctions, objects, shab_publications)
- **Key Relationships**: auctions(1:many)→objects, auctions(1:many)→shab_publications
- **Primary Keys**: Internal auction UUIDs + SHAB identifiers (meta_id, publication_nr, subsection_id)
- **Extensibility**: Objects table designed for future data source integration
- **⚠ Missing System Story**: Database schema setup with relationship constraints

**S1c. Historical Data Backfill**

- **Process**: Retrieve last 90 days of auction publications for initial dataset
- **Data Processing**: Parse XML, extract to structured fields, geocode addresses
- **Quality Assurance**: Validate data completeness, handle parsing failures
- **Storage Strategy**: Complete XML retention + structured field extraction
- **⚠ Missing System Story**: Historical data import with progress tracking and quality validation

**S1d. LLM Pipeline Setup**

- **Process**: Configure German text processing for property classification and value extraction
- **Model Training**: Fine-tune on Swiss auction language patterns
- **Quality Control**: Establish confidence thresholds and manual review workflows
- **Field Mapping**: Extract estimated values, property types, viewing appointments from unstructured text
- **⚠ Missing System Story**: LLM integration with quality metrics and human oversight

**S1e. Map Data Integration**

- **Process**: Geocode all property addresses, generate pin coordinates
- **Clustering Algorithm**: Implement grouped pin logic for multiple properties at same location
- **Performance Optimization**: Index geographic data for fast map queries
- **Visual System**: Assign color coding based on LLM property classification
- **⚠ Missing System Story**: Geographic data processing with clustering and indexing

#### CUJ-S2: Daily Data Synchronization & Updates

**Trigger**: Automated daily sync at 4:00 AM CET (after SHAB publication)
**Goal**: Maintain fresh, accurate auction data for real-time user experience
**Scope**: MVP System Requirements

**System Journey Steps**:

**S2a. Incremental Data Sync**

- **Process**: Query SHAB API for publications since last sync timestamp
- **Publication Tracking**: Store meta_id, publication_nr, subsection_id for each SHAB message
- **Duplicate Prevention**: Compare identifiers to prevent reprocessing same publications
- **Change Detection**: Identify updates/cancellations for existing auctions (MVP: cancellations only)
- **⚠ Missing System Story**: Incremental sync with change detection and deduplication

**S2b. Auction-Publication Matching**

- **Process**: Match new SHAB publications to existing auction records
- **Initial Publications**: Create new auction + objects records
- **Cancellations**: Update auction status, maintain publication link
- **TBD Challenge**: Algorithm for matching subsequent publications to existing auctions
- **Data Integrity**: Maintain 1:many relationships (auctions→publications)
- **⚠ Missing System Story**: Publication-to-auction matching logic with error handling

**S2c. Real-time LLM Processing**

- **Process**: Process new German auction text through classification pipeline
- **Batch Optimization**: Group similar properties for efficient processing
- **Quality Monitoring**: Track classification accuracy, flag low-confidence results
- **Field Updates**: Extract and store estimated values, property types, viewing appointments
- **⚠ Missing System Story**: Automated text processing with quality monitoring

**S2d. User-Facing Updates**

- **Process**: Update map pins, filter data, search indices in real-time
- **Cache Invalidation**: Clear cached results, trigger fresh API responses for affected queries
- **Data Consistency**: Ensure map-list synchronization reflects latest auction data
- **Performance**: Minimize update latency for user-facing systems
- **⚠ Missing System Story**: Real-time data updates with cache management

**S2e. System Health & Recovery**

- **Process**: Monitor sync success rates, API response times, data quality metrics
- **Error Recovery**: Retry failed operations, alert administrators to persistent issues
- **Performance Tracking**: Log processing times, identify bottlenecks
- **Data Validation**: Ensure auction-object-publication relationships remain consistent
- **⚠ Missing System Story**: System monitoring with automated recovery and alerting

### Future User Journeys (Post-MVP)

#### Free Account Phase (2 months after MVP)

**CUJ-F1: Account Registration & Email Setup**

- **Scope**: User registration, email verification, basic profile setup
- **Personas**: Both Thomas and Sandra segments
- **Key Features**: Registration workflow, email verification, notification preferences setup
- **Success Metrics**: 60% conversion from anonymous to registered users

**CUJ-F2: Saved Searches & Email Alert Management**

- **Scope**: Create saved searches, manage email notifications for new matching properties
- **Personas**: Engaged users wanting regular updates on specific criteria
- **Key Features**: Search persistence, email notification system, alert frequency controls, property matching alerts
- **Success Metrics**: 40% of registered users create saved searches, 25% weekly email engagement

#### Paid Subscription Phase (2 months after Free Accounts)

**CUJ-P1: Premium Trial & Subscription Conversion**

- **Scope**: 7-day premium trial, feature discovery, payment processing, subscription management
- **Personas**: Primarily Sandra (business users), some Thomas (power users)
- **Key Features**: Trial activation, premium feature access, subscription checkout, billing management
- **Success Metrics**: 15% trial-to-paid conversion, CHF 3,000-6,000 MRR by Month 6

#### Advanced Features Phase (4 months after Paid Subscription)

**Professional & Data Enrichment Features:**

- **Team Collaboration**: Multi-user access, shared saved searches, team dashboards
- **Data Enrichment**: Aerial imagery integration, GIS data overlay, Kataster zoning information
- **Advanced Analytics**: Historical auction outcome data, market insights, ROI tracking
- **Professional Tools**: Advanced reporting, data export capabilities, CRM integration
- **Enhanced Property Intelligence**: Property history, comparable sales analysis, investment scoring

#### International Expansion Phase (12 months after Advanced Features)

**Geographic & Market Extension:**

- **European Markets**: Extend platform to other European foreclosure systems
- **Multi-language Support**: Localized interfaces and processing for different countries
- **Cross-border Intelligence**: International investment opportunities and market comparison
- **Regulatory Compliance**: Adapt to different legal frameworks and data requirements

## 6. Implementation & Success

### Technical Architecture

#### Core Technology Stack

**Frontend**:

- **Framework**: React 18+ with TypeScript for type safety and developer productivity
- **Mapping**: Leaflet.js with OpenStreetMap tiles for cost-effective, customizable mapping
- **State Management**: Zustand for lightweight, performant state management
- **Styling**: Tailwind CSS for consistent, responsive design system
- **Build Tool**: Vite for fast development and optimized production builds

**Backend**:

- **Runtime**: Node.js with Express.js for API server
- **Database**: PostgreSQL with PostGIS extension for geospatial data
- **Data Processing**: LLM integration (OpenAI GPT-4 or local models) for German text parsing
- **Caching**: Redis for session management and API response caching
- **Background Jobs**: Bull Queue for SHAB data scraping and processing

**Infrastructure**:

- **Hosting**: DigitalOcean or Hetzner (Swiss/German data centers)
- **CDN**: CloudFlare for global performance and DDoS protection
- **Monitoring**: Sentry for error tracking, PostHog for user analytics
- **CI/CD**: GitHub Actions for automated testing and deployment

#### Data Architecture

**High-Level Data Strategy**:

- **3-Table Schema**: auctions, objects, shab_publications with defined relationships
- **SHAB Integration**: Daily automated API sync with complete XML retention
- **LLM Processing**: German text extraction for property classification and value parsing
- **Geographic Data**: Spatial indexing for map performance and pin clustering
- **Extensibility**: Objects table designed for future data source integration

**Detailed Technical Specifications**: See `docs/auctiondeal_architecture.md` for:

- Complete database schema with field definitions
- Data processing pipeline workflows
- SHAB publication matching algorithms
- Performance optimization strategies
- LLM integration and confidence scoring

**API Design**:

- RESTful endpoints with consistent error handling
- GraphQL consideration for complex filtering requirements
- Rate limiting and authentication for subscription features
- WebSocket connections for real-time map updates

### Development Timeline

#### Phase 0: Foundation (Weeks 1-2)

- **Week 1**: Development environment setup, database schema, SHAB API integration
- **Week 2**: Core data processing pipeline, LLM integration for text extraction

#### MVP Development (Weeks 3-4)

- **Week 3**: Frontend foundation - map integration, basic filtering, responsive design
- **Week 4**: Property detail pages, testing, deployment, performance optimization

#### Post-Launch Iterations (Month 2-4)

- **Month 2**: Beta registration system, user analytics, performance monitoring
- **Month 3**: Subscription infrastructure, payment integration, premium features
- **Month 4**: Advanced filtering, saved searches, notification system

### Success Metrics & KPIs

#### MVP Success Criteria (Month 1)

- **Traffic**: 100+ unique monthly visitors
- **Engagement**: 25% feature usage rate (filters, map interaction)
- **Retention**: 20% return visitor rate within 30 days
- **Performance**: <3s initial page load, <1s filter response time

#### Beta Phase Metrics (Month 2-3)

- **Registration**: 60% conversion from anonymous to registered users
- **User Base**: 500+ registered beta users by Month 3
- **Activity**: 40% weekly active user rate among registered users
- **Feedback**: Net Promoter Score (NPS) >50

#### Subscription Launch KPIs (Month 4+)

- **Conversion**: 15% trial-to-paid subscription rate
- **Revenue**: CHF 3,000-6,000 MRR by Month 6, CHF 10,000-20,000 MRR by Month 18
- **Retention**: 85% monthly subscriber retention rate
- **Growth**: 300 paid subscribers (Month 6), 1,000 paid subscribers (Month 18)

### Go-to-Market Strategy

#### Launch Marketing (Month 1-3)

**Digital Marketing**:

- **Google Ads**: Targeted campaigns for "Swiss foreclosure auctions", "Zwangsversteigerung"
- **Facebook/Instagram Ads**: Property investor interest targeting, lookalike audiences
- **Content Marketing**: SEO-optimized blog posts about Swiss auction market insights
- **Budget**: CHF 2,000-3,000/month for paid acquisition

**Community Engagement**:

- **Real Estate Forums**: Active participation in Swiss property investor communities
- **LinkedIn Outreach**: Direct engagement with small real estate firms
- **Local Events**: Swiss property investment meetups and conferences
- **Press Coverage**: Swiss real estate and fintech media outreach

#### Subscription Conversion (Month 4+)

**Product-Led Growth**:

- **Free Trial**: 7-day premium feature access with gradual feature restriction
- **Email Sequences**: Automated onboarding and conversion campaigns
- **In-App Messaging**: Contextual upgrade prompts based on usage patterns
- **Value Demonstration**: Clear ROI calculation (time saved vs subscription cost)

**Retention Strategy**:

- **Customer Success**: Proactive support for high-value users
- **Feature Updates**: Regular premium feature releases based on user feedback
- **Community Building**: Exclusive subscriber benefits and market insights
- **Annual Incentives**: 20% discount for annual subscriptions

### Risk Assessment & Mitigation

#### Technical Risks

- **SHAB API Changes**: Monitor for API modifications, maintain fallback data sources
- **LLM Accuracy**: Implement human review workflows, continuous model improvement
- **Scalability**: Design for 10x growth, implement caching and CDN strategies
- **Data Quality**: Comprehensive error handling, manual data correction workflows

#### Business Risks

- **Competition**: Continuous feature differentiation, patent considerations where applicable
- **Market Size**: Conservative growth projections, international expansion planning
- **Regulatory**: GDPR compliance, Swiss data protection requirements
- **Economic Conditions**: Diversified revenue model, cost structure flexibility

#### Mitigation Strategies

- **Technical**: Comprehensive monitoring, automated testing, gradual feature rollouts
- **Business**: Customer feedback loops, competitive intelligence, financial reserves
- **Legal**: Regular compliance audits, legal counsel consultation, privacy-first design

### Success Definition

**MVP Success**: Platform demonstrates product-market fit with consistent user engagement and return visits, validating core value proposition before monetization investment.

**Phase 1 Success**: Sustainable subscription business with 300+ paying customers, proving scalable revenue model and justifying expansion to enhanced features and geographic markets.

**Long-term Success**: Market-leading Swiss auction platform with 1,000+ subscribers, expansion-ready technology platform, and clear path to international markets.
