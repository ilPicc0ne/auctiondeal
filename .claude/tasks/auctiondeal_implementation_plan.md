# Auctiondeal Implementation Task Plan
## From User Stories to Technical Implementation

Generated from `docs/auctiondeal_prd1.md` user stories and requirements.

---

## 📋 Implementation Overview

### **Project Structure**
```
services/
├── collector-node/    # SHAB data processing (existing)
├── webapp/           # Next.js frontend application  
└── etl-py/          # Future LLM processing service

libs/
├── shared-ts/       # Shared utilities (existing)
└── contracts/       # API contracts

db/
└── prisma/          # Database schema (existing)
```

### **Technology Stack**
- **Backend**: Node.js/TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: Next.js 14, React 18, TypeScript
- **Map Library**: Leaflet or Mapbox GL JS
- **LLM Integration**: OpenAI GPT-4 or Claude
- **Deployment**: TBD (Vercel, Railway, or self-hosted)

---

## 🎯 Phase 1: MVP/Beta 1 (30 Days)

**Goal**: Validate core value proposition with basic functionality  
**Success Metrics**: Monthly Active Users, geographic zoom engagement, filter usage

### Week 1-2: Foundation & Data Pipeline

#### **Epic 1.1: Database Foundation Enhancement**
*From User Story 1.1: Initial Database Setup*

**Tasks:**
- [ ] **T1.1.1** Review and extend existing Prisma schema
  - Add property classification fields (`propertyType`, `estimatedValue`, `classificationConfidence`)
  - Add address normalization fields
  - Create performance indexes for map queries
  - **Duration**: 1 day
  - **Dependencies**: Existing schema analysis

- [ ] **T1.1.2** Implement data validation rules  
  - Property type enumeration (Land, MFH, EFH, Commercial, Wohnung, Parking, Misc)
  - Swiss CHF value validation
  - Geographic coordinate validation
  - **Duration**: 1 day
  - **Dependencies**: T1.1.1

- [ ] **T1.1.3** Database migration and production setup
  - Create migration scripts
  - Set up test and production databases  
  - Data integrity constraints
  - **Duration**: 1 day
  - **Dependencies**: T1.1.2

#### **Epic 1.2: Basic SHAB Data Loading**
*From User Stories 1.2-1.3: Historical Backfill, Daily Sync (without LLM processing)*

**Tasks:**
- [ ] **T1.2.1** Historical data backfill (90 days)
  - Batch processing scripts for historical SHAB data
  - Store raw XML content and basic metadata
  - Duplicate prevention (meta ID tracking)
  - Data quality validation and cleanup
  - **Duration**: 2 days  
  - **Dependencies**: T1.1.3

- [ ] **T1.2.2** Enhanced daily synchronization
  - Improve existing daily sync reliability
  - Error handling and retry logic  
  - Status monitoring and alerting
  - Raw data storage without classification
  - **Duration**: 1 day
  - **Dependencies**: Existing collector-node service

- [ ] **T1.2.3** Basic data API endpoints
  - Create API routes to serve raw SHAB data
  - Geographic filtering by coordinates
  - Date range filtering
  - Basic pagination for large datasets
  - **Duration**: 1 day
  - **Dependencies**: T1.2.1

#### **Epic 1.3: ETL Processing Service (Separate Track)**
*From User Stories 1.4 & 1.4.1: LLM-Powered Property Classification and Address Geocoding (can be developed in parallel)*

**Tasks:**
- [ ] **T1.3.1** ETL service foundation (etl-py)
  - Set up Python service for LLM processing
  - OpenAI/Claude API integration
  - Create classification prompt engineering
  - **Duration**: 2 days
  - **Dependencies**: None (parallel track)

- [ ] **T1.3.2** Property classification algorithms
  - German text parsing for property type identification
  - Estimated value extraction from auction descriptions
  - Location/address normalization
  - Confidence scoring (target: 95%+ accuracy)
  - **Duration**: 3 days
  - **Dependencies**: T1.3.1

- [ ] **T1.3.3** Address extraction and geocoding
  - Swiss address pattern recognition in German text
  - Address normalization (street, number, postal code, canton)
  - Integration with Swiss geocoding services (swisstopo or Google)
  - Fallback to municipality-level coordinates
  - Coordinate validation within Swiss boundaries
  - **Duration**: 2 days
  - **Dependencies**: T1.3.1

- [ ] **T1.3.4** ETL processing pipeline
  - Batch processing of existing raw data
  - Real-time processing of new daily data  
  - Database updates with classified and geocoded information
  - **Duration**: 2 days
  - **Dependencies**: T1.3.2, T1.3.3, T1.2.1

### Week 3: Frontend Foundation

#### **Epic 2.1: Next.js Application Setup**
*Supporting all frontend user stories*

**Tasks:**
- [ ] **T2.1.1** Next.js 14 project initialization
  - TypeScript configuration
  - ESLint and Prettier setup
  - Tailwind CSS integration
  - **Duration**: 1 day
  - **Dependencies**: None

- [ ] **T2.1.2** Basic routing and page structure
  - Home page with map container
  - Property detail page routing (`/property/[id]`)
  - API routes for data fetching
  - **Duration**: 1 day
  - **Dependencies**: T2.1.1

- [ ] **T2.1.3** Map library integration
  - Leaflet.js setup with TypeScript
  - Switzerland base map configuration
  - Mobile-responsive map container
  - **Duration**: 2 days
  - **Dependencies**: T2.1.2

#### **Epic 2.2: Basic Map Interface**  
*From User Stories 2.1-2.3: Map Display, Pin Interactions, Navigation*

**Tasks:**
- [ ] **T2.2.1** Property pin rendering system
  - Basic pins for all properties (single color initially)
  - Pin clustering for dense areas
  - Dynamic loading based on map bounds
  - **Duration**: 2 days
  - **Dependencies**: T2.1.3, T1.2.3 (basic data API)

- [ ] **T2.2.2** Pin interaction functionality
  - Hover previews for desktop
  - Tap interactions for mobile  
  - Property preview cards with key details
  - Navigation to detail pages on click
  - **Duration**: 2 days
  - **Dependencies**: T2.2.1

- [ ] **T2.2.3** Map navigation controls
  - Zoom controls and smooth transitions
  - Pan functionality
  - Responsive clustering at different zoom levels
  - **Duration**: 1 day
  - **Dependencies**: T2.2.1

### Week 4: Core Features

#### **Epic 3.1: Property Filtering System**
*From User Stories 3.1-3.4: Property Type, Price, Geographic, Session Memory*

**Tasks:**
- [ ] **T3.1.1** Filter UI components
  - Property type multi-select (Swiss taxonomy)
  - Price range dual-handle slider with CHF formatting
  - Canton/geographic multi-select
  - **Duration**: 2 days
  - **Dependencies**: T2.1.2

- [ ] **T3.1.2** Real-time map updates
  - Filter application to map pins
  - API integration for filtered data
  - Performance optimization for large datasets
  - **Duration**: 2 days
  - **Dependencies**: T3.1.1, T2.2.1

- [ ] **T3.1.3** Session storage and persistence
  - Browser session storage for filter states
  - Filter restoration on page reload
  - Clear/reset functionality
  - **Duration**: 1 day
  - **Dependencies**: T3.1.1

#### **Epic 4.1: Property Details & List View**
*From User Stories 4.1-4.2, 5.1-5.3: Detail Pages, List View, Property Cards*

**Tasks:**
- [ ] **T4.1.1** Property detail page implementation
  - Basic auction information display (raw data)
  - Mobile-responsive design
  - SEO-friendly URL structure
  - **Duration**: 2 days
  - **Dependencies**: T2.1.2, T1.2.3 (basic data API)

- [ ] **T4.1.2** Property list view component
  - Map-synchronized property cards
  - Real-time viewport updates
  - Property card design with key information
  - **Duration**: 2 days
  - **Dependencies**: T3.1.2

- [ ] **T4.1.3** List sorting and layout
  - Default sort by auction date
  - Responsive grid/stack layout
  - Loading states and empty state handling
  - **Duration**: 1 day
  - **Dependencies**: T4.1.2

### 🔄 **Phase 1 Implementation Strategy**

**Primary Track** (Weeks 1-4): Core functionality with raw SHAB data
- MVP will launch with basic property display using raw auction data
- Users can browse, filter, and view properties without advanced classification
- This provides immediate value while ETL processing develops separately

**Parallel ETL Track** (Epic 1.3): Can extend into Phase 2
- LLM-powered property classification runs as separate service
- Gradually enhances existing properties with classified data
- Color-coded pins and advanced filtering activated as classification completes

**Benefits of This Approach:**
- ✅ Faster time to market with basic functionality
- ✅ Risk reduction by separating complex LLM processing
- ✅ Users get value immediately from raw data browsing
- ✅ Enhanced features roll out progressively as ETL completes

---

## 🚀 Phase 2: MVP/Beta 2 (+2 Months)

**Goal**: User acquisition and retention validation  
**Success Metrics**: Monthly Active Signed-in Users, registration conversion, return user engagement

### Epic 5.1: User Registration System
*Supporting future user stories for saved searches and alerts*

**Tasks:**
- [ ] **T5.1.1** Authentication system implementation
  - User registration and login flows
  - Session management
  - Email verification system
  - **Duration**: 1 week
  - **Dependencies**: Phase 1 completion

- [ ] **T5.1.2** User profile and preferences
  - Basic user profile management
  - Saved search preferences
  - Geographic preference storage
  - **Duration**: 3 days
  - **Dependencies**: T5.1.1

### Epic 5.2: Email Alert System
*From deferred Phase 2 requirements*

**Tasks:**
- [ ] **T5.2.1** Saved search functionality
  - Search criteria persistence
  - User dashboard for saved searches
  - Search management interface
  - **Duration**: 1 week
  - **Dependencies**: T5.1.2

- [ ] **T5.2.2** Email notification system
  - Daily/weekly email alerts for new matches
  - Email template design and personalization
  - Unsubscribe and frequency management
  - **Duration**: 1 week
  - **Dependencies**: T5.2.1

### Epic 5.3: Enhanced User Experience
*Supporting user retention goals*

**Tasks:**
- [ ] **T5.3.1** Advanced session memory
  - Cross-session filter and zoom persistence
  - User preference learning
  - Personalized default views
  - **Duration**: 3 days
  - **Dependencies**: T5.1.1

- [ ] **T5.3.2** Performance optimization
  - Map rendering optimization
  - API caching strategies
  - CDN integration for static assets
  - **Duration**: 1 week
  - **Dependencies**: Phase 1 performance analysis

---

## 💰 Phase 3: Paid Subscription (+2 Months)

**Goal**: Revenue generation and conversion validation  
**Success Metrics**: Monthly Paid Users, trial conversion rates

### Epic 6.1: Subscription Management
*Supporting monetization strategy*

**Tasks:**
- [ ] **T6.1.1** Payment integration
  - Stripe integration for Swiss market
  - Subscription billing management
  - Trial period implementation
  - **Duration**: 1 week
  - **Dependencies**: T5.1.1

- [ ] **T6.1.2** Access control system
  - Feature gating for premium functions
  - Trial limitations and upgrade prompts
  - Grandfathering system for beta users
  - **Duration**: 3 days
  - **Dependencies**: T6.1.1

### Epic 6.2: Premium Features
*Value-added functionality for paid users*

**Tasks:**
- [ ] **T6.2.1** Advanced filtering capabilities
  - Extended search criteria
  - Historical auction tracking
  - Advanced sorting options
  - **Duration**: 1 week
  - **Dependencies**: T6.1.2

- [ ] **T6.2.2** Data export functionality
  - CSV/PDF export for property lists
  - Custom report generation
  - Data sharing capabilities
  - **Duration**: 3 days
  - **Dependencies**: T6.2.1

---

## 🔬 Phase 4: Advanced Features (+3 Months)

**Goal**: Expand value proposition and increase ARPU  
**Success Metrics**: Advanced feature adoption, user retention, pricing tier upgrades

### Epic 7.1: Property Intelligence System
*From User Story advanced requirements*

**Tasks:**
- [ ] **T7.1.1** GIS data integration
  - Swiss cadastral data integration
  - Zoning information display
  - Municipal boundary mapping
  - **Duration**: 2 weeks
  - **Dependencies**: Legal data licensing research

- [ ] **T7.1.2** Aerial imagery integration
  - Satellite/aerial image overlays
  - Property visualization enhancement
  - Historical imagery comparison
  - **Duration**: 1 week
  - **Dependencies**: Imagery licensing agreements

- [ ] **T7.1.3** Location intelligence
  - Neighborhood scoring algorithms
  - Proximity to amenities calculation
  - Market trend analysis
  - **Duration**: 2 weeks
  - **Dependencies**: T7.1.1

---

## 📊 Cross-Phase Infrastructure

### Analytics & Monitoring
*Supporting all phases with data-driven insights*

**Tasks:**
- [ ] **TI.1** Analytics platform setup
  - Google Analytics 4 or Mixpanel integration
  - Custom event tracking for KPIs
  - GDPR-compliant consent management
  - **Duration**: 2 days
  - **Priority**: Phase 1 Week 4

- [ ] **TI.2** Performance monitoring
  - Application performance monitoring
  - Error tracking and alerting
  - Database performance monitoring
  - **Duration**: 1 day
  - **Priority**: Phase 1 Week 4

### SEO & Marketing
*Supporting user acquisition goals*

**Tasks:**
- [ ] **TI.3** SEO optimization
  - Meta tags and structured data
  - Sitemap generation
  - Core Web Vitals optimization
  - **Duration**: 2 days
  - **Priority**: Phase 1 Week 4

- [ ] **TI.4** Marketing page setup
  - Landing page optimization
  - Feature showcase pages
  - Pricing page (for future phases)
  - **Duration**: 3 days
  - **Priority**: Phase 2 Week 1

### Testing & Quality Assurance
*Ensuring reliability across all features*

**Tasks:**
- [ ] **TI.5** Automated testing setup
  - Unit tests for critical business logic
  - Integration tests for SHAB data pipeline
  - End-to-end tests for user workflows
  - **Duration**: 1 week
  - **Priority**: Phase 1 Week 2-4 (parallel with development)

- [ ] **TI.6** User acceptance testing
  - Beta user feedback collection
  - Performance testing with real data
  - Cross-browser and device testing
  - **Duration**: Ongoing
  - **Priority**: Phase 1 Week 4, Phase 2 launch

---

## 🎯 Success Metrics & KPIs

### Phase 1 (MVP) Metrics
- **Primary**: Monthly Active Users (unique visitors)
- **Secondary**: 
  - Geographic zoom engagement (% users who zoom into specific regions)
  - Filter usage rates (% users who apply filters)
  - Property detail page views (% users who click through to details)
  - Mobile vs desktop usage patterns

### Phase 2 (User Accounts) Metrics  
- **Primary**: Monthly Active Signed-in Users
- **Secondary**:
  - Registration conversion rates (% anonymous → registered)
  - Email alert subscription rates
  - Return user engagement (repeat visits within 30 days)

### Phase 3 (Paid) Metrics
- **Primary**: Monthly Paid Users 
- **Secondary**:
  - Trial-to-paid conversion rates
  - Active email alerts per user
  - User retention (90-day retention rate)

### Phase 4 (Advanced) Metrics
- **Primary**: Advanced feature adoption rates
- **Secondary**:
  - User retention improvement vs Phase 3
  - Average revenue per user (ARPU)
  - Feature usage correlation with retention

---

## ⚠️ Key Risks & Mitigations

### Technical Risks
1. **SHAB API Dependency**
   - *Risk*: API changes or unavailability
   - *Mitigation*: Implement robust error handling, data caching, backup data sources

2. **LLM Classification Accuracy**
   - *Risk*: Below 95% accuracy target
   - *Mitigation*: Extensive testing with real data, human validation workflows, confidence scoring

3. **Map Performance at Scale**
   - *Risk*: Slow loading with large datasets
   - *Mitigation*: Implement clustering, viewport-based loading, caching strategies

### Business Risks
1. **User Adoption Challenge**
   - *Risk*: Low user acquisition vs established competitors
   - *Mitigation*: Strong SEO focus, targeted Google Ads, beta user feedback integration

2. **Trial-to-Paid Conversion**  
   - *Risk*: Low conversion rates
   - *Mitigation*: Compelling trial value, smooth UX, grandfathered beta benefits

### Mitigation Timeline
- **T Risk.1**: Implement error handling and monitoring (Phase 1 Week 2)
- **T Risk.2**: LLM accuracy testing and validation (Phase 1 Week 2-3)
- **T Risk.3**: Performance optimization (Phase 1 Week 4, ongoing)

---

## 📝 Implementation Notes

### Development Approach
- **Agile methodology** with 1-week sprints
- **Feature-driven development** aligned with user stories
- **Test-driven development** for critical business logic
- **Continuous integration/deployment** for rapid iteration

### Quality Gates
- [ ] All user story acceptance criteria met
- [ ] 90%+ test coverage for business logic
- [ ] Performance targets met (< 1s map load, < 300ms filters)
- [ ] Mobile responsiveness validated
- [ ] GDPR compliance requirements satisfied

### Team Coordination
- **Backend Focus**: SHAB data processing, LLM integration, APIs
- **Frontend Focus**: React components, map integration, user experience  
- **Full-Stack**: Feature integration, performance optimization, deployment

---

*This implementation plan provides a comprehensive roadmap from user stories to technical execution, organized by phases with clear dependencies, timelines, and success metrics.*