# AuctionDeal System Design Overview

## System Purpose
Transform unstructured SHAB auction data into an intelligent property discovery platform for Swiss investors through automated multi-language processing and interactive geographic exploration.

## Core Architecture Pattern: Hexagonal (Ports & Adapters)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   External      │    │   Application    │    │   Domain Core   │
│   Systems       │◄──►│   Layer          │◄──►│   (Business     │
│   (SHAB, LLM)   │    │   (Use Cases)    │    │   Logic)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Domain Bounded Contexts

### 1. Auction Data Management
**Responsibility**: Raw SHAB data ingestion and auction lifecycle
- Daily SHAB XML synchronization
- Auction status monitoring (published/cancelled)
- Raw text preservation for reprocessing

### 2. Property Intelligence  
**Responsibility**: Multi-language classification and enrichment
- German/French/Italian text processing
- Property type classification (Wohnung, EFH, MFH, etc.)
- Value extraction with confidence scoring
- Location standardization

### 3. User Discovery
**Responsibility**: Interactive map interface and filtering
- Geographic viewport queries
- Real-time property filtering
- Session state management
- Property card generation

## Database Schema (PostgreSQL + PostGIS)

### Core Tables

```sql
-- Raw SHAB data storage
CREATE TABLE shab_publications (
    id VARCHAR(50) PRIMARY KEY,
    publish_date DATE NOT NULL,
    xml_content TEXT NOT NULL,
    canton VARCHAR(2) NOT NULL,
    
    -- SHAB metadata from XML
    rubric VARCHAR(10) NOT NULL,          -- e.g., "SB"
    sub_rubric VARCHAR(10) NOT NULL,      -- e.g., "SB01" 
    official_language VARCHAR(2) NOT NULL, -- from XML <language>
    
    processing_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Processed auctions
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shab_publication_id VARCHAR(50) NOT NULL,
    auction_date TIMESTAMP NOT NULL,
    auction_location TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published', -- published, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (shab_publication_id) REFERENCES shab_publications(id)
);

-- Individual property objects within auctions
CREATE TABLE auction_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL,
    raw_text TEXT NOT NULL, -- Original German/French/Italian text
    object_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);

-- Classified and enriched properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_object_id UUID NOT NULL,
    
    -- Classification results
    property_type VARCHAR(20) NOT NULL, -- Land, EFH, MFH, Wohnung, Commercial, Parking, Misc
    classification_confidence DECIMAL(3,2),
    
    -- Value extraction
    estimated_value_chf DECIMAL(12,2),
    value_confidence DECIMAL(3,2),
    
    -- Location data
    address TEXT,
    coordinates GEOMETRY(POINT, 4326), -- PostGIS for lat/lng
    canton VARCHAR(2),
    municipality TEXT,
    
    -- Processing metadata
    source_language VARCHAR(2), -- de, fr, it
    processed_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (auction_object_id) REFERENCES auction_objects(id) ON DELETE CASCADE
);

-- Performance indexes for map queries
CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);
CREATE INDEX idx_properties_type_value ON properties(property_type, estimated_value_chf);
CREATE INDEX idx_auctions_date_status ON auctions(auction_date, status);
```

## Data Flow Architecture

```
Daily Scheduler (16:00 CET)
    ↓
SHAB XML API → Raw Storage → Language Detection
    ↓                              ↓
Multi-Language Processing    →    Property Classification
    ↓                              ↓
Value Extraction → Location Parsing → Database Storage
    ↓
Map Interface Updates ← Real-time Filtering ← User Interface
```

## API Design Overview

### Core Endpoints Structure
```
/api/properties/search    # Geographic and filtered property search
/api/properties/{id}      # Individual property details
/api/auctions/{id}        # Auction information
/api/filters/options      # Available filter values (types, cantons)
```

### Key Response Format
```json
{
  "properties": [
    {
      "id": "uuid",
      "address": "Bahnhofstrasse 1, 8001 Zürich",
      "coordinates": [47.3769, 8.5417],
      "propertyType": "EFH",
      "estimatedValue": 950000,
      "auctionDate": "2024-03-15T10:00:00Z",
      "confidence": 0.92,
      "sourceLanguage": "de"
    }
  ],
  "totalCount": 45,
  "viewport": { "ne": [47.4, 8.6], "sw": [47.2, 8.4] }
}
```

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL 15+ with PostGIS extension
- **Caching**: Redis for viewport queries (5-minute TTL)
- **LLM Processing**: External API (OpenAI/Anthropic)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Map Library**: Leaflet with OpenStreetMap
- **Styling**: Tailwind CSS
- **State Management**: Zustand (lightweight)

### Deployment
- **Platform**: Vercel (auto-scaling, CDN)
- **Database**: Managed PostgreSQL (AWS RDS/Vercel Postgres)
- **Monitoring**: Built-in Vercel analytics

## Processing Pipeline

### Daily SHAB Synchronization
1. **Fetch**: New XML publications from SHAB API
2. **Parse**: Extract auction and object data plus metadata (rubric, subRubric, official language)
3. **Route**: Direct language-based processing using XML language field
4. **Classify**: Property type extraction via LLM with language-specific prompts
5. **Enrich**: Value extraction and location standardization
6. **Store**: Structured data with confidence scoring

### Multi-Language Support
- **Official Language**: Use authoritative language from SHAB XML metadata
- **Specialized Processing**: Language-specific LLM prompts and parsing rules
- **Unified Output**: Standard property types regardless of source language
- **Metadata Tracking**: Preserve rubric/subRubric classification from SHAB

## Performance Requirements

### Response Times
- Map viewport queries: < 300ms
- Property detail pages: < 500ms
- Filter applications: < 200ms

### Scalability Targets
- 1000+ concurrent map users
- 10,000+ daily property searches
- 50,000+ properties in database

## Future Phase Considerations

### Phase 2: User Management
- User registration and authentication
- Saved searches and email alerts
- Session persistence across devices

### Phase 3: Advanced Intelligence
- Property imagery and documents
- Municipal data integration
- Zoning and development information

### Phase 4: Platform Extensions
- Mobile app development  
- English language frontend (internationalization)
- API access for third parties
- International market expansion

## Implementation Priorities

1. **Core Data Pipeline**: SHAB ingestion → multi-language processing → structured storage
2. **Map Interface**: Interactive Switzerland map with property pins and filtering
3. **Property Details**: Comprehensive auction information display
4. **Performance Optimization**: Spatial indexing and caching implementation
5. **Quality Assurance**: Classification accuracy monitoring and improvement

This design provides the architectural foundation for implementing features incrementally while maintaining scalability and code quality throughout development.