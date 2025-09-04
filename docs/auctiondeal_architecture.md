# Auctiondeal Technical Architecture

## Overview

This document provides detailed technical specifications for the Auctiondeal platform, complementing the product requirements in `auctiondeal_prd.md`.

## Data Architecture

### SHAB Integration Strategy
- Daily automated API calls to `https://www.shab.ch/api/v1/publications`
- Complete XML retention for audit trail and reprocessing capability
- LLM-powered extraction of structured data from German text
- Publication tracking via meta_id, publication_nr, subsection_id identifiers

### Database Schema Design

#### Core 3-Table Structure

```sql
-- Auctions: Core auction information including legal data
CREATE TABLE auctions (
    id UUID PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, completed
    auction_date DATE NOT NULL,
    auction_time TIME,
    auction_location TEXT,
    registration_deadline TIMESTAMP,
    circulation_deadline TIMESTAMP,
    responsible_office TEXT,
    additional_legal_remedy TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Objects: Property details with extensibility for data enrichment
CREATE TABLE objects (
    id UUID PRIMARY KEY,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    property_description TEXT, -- Full auctionObjects text
    estimated_value DECIMAL(12,2), -- CHF amount
    property_type VARCHAR(50), -- LLM classification: Land, MFH, EFH, Commercial, Various, Parking
    property_type_confidence DECIMAL(3,2), -- LLM confidence score 0-1
    viewing_appointments TEXT, -- Extracted from remarks field
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    -- Extensibility fields for future data sources
    aerial_imagery_url TEXT,
    gis_data JSONB,
    kataster_info JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SHAB Publications: Track all publication messages
CREATE TABLE shab_publications (
    id UUID PRIMARY KEY,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    meta_id VARCHAR(100) NOT NULL,
    publication_nr VARCHAR(50) NOT NULL,
    subsection_id VARCHAR(50),
    publication_date DATE NOT NULL,
    publication_type VARCHAR(50) DEFAULT 'initial', -- initial, cancellation, update
    raw_xml TEXT NOT NULL, -- Complete original XML
    processed_at TIMESTAMP DEFAULT NOW(),
    processing_status VARCHAR(50) DEFAULT 'processed', -- processed, failed, pending
    UNIQUE(meta_id, publication_nr, subsection_id)
);
```

#### Key Relationships
- **auctions(1) → objects(many)**: One auction can include multiple properties
- **objects(1) → auctions(1)**: Each property belongs to exactly one auction
- **auctions(1) → shab_publications(many)**: One auction links to multiple SHAB messages
- **shab_publications(1) → auctions(1)**: Each publication references one auction

### Data Processing Pipeline

#### 1. Publication Ingestion
- Store complete XML in shab_publications table
- Extract SHAB identifiers (meta_id, publication_nr, subsection_id)
- Track publication type (initial, cancellation, update)

#### 2. Auction-Publication Matching
- **Initial Publications**: Create new auction + objects records
- **Cancellations**: Update auction status, maintain publication link
- **Updates (Future)**: TBD matching algorithm for property address/description correlation

#### 3. LLM Field Extraction
- Parse German auctionObjects text for property details
- Extract estimated values from "Rechtskräftige Betreibungsamtliche Schätzung" patterns
- Classify property types with confidence scoring
- Extract viewing appointments from remarks field
- Store confidence scores for quality monitoring

#### 4. Geographic Processing
- Geocode property addresses to lat/lng coordinates
- Implement spatial indexing for map performance
- Generate clustered pin logic for nearby properties

### Data Quality & Extensibility
- Complete audit trail via XML retention
- Confidence scoring for LLM-extracted fields
- Extensible objects table for future data enrichment (aerial imagery, GIS, Kataster)
- Robust error handling and retry mechanisms
- Performance optimization via PostgreSQL indexing and PostGIS spatial queries

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript for type safety and developer productivity
- **Mapping**: Leaflet.js with OpenStreetMap tiles for cost-effective, customizable mapping
- **State Management**: Zustand for lightweight, performant state management
- **Styling**: Tailwind CSS for consistent, responsive design system
- **Build Tool**: Vite for fast development and optimized production builds

### Backend
- **Runtime**: Node.js with Express.js for API server
- **Database**: PostgreSQL with PostGIS extension for geospatial data
- **Data Processing**: LLM integration (OpenAI GPT-4 or local models) for German text parsing
- **Caching**: Redis for session management and API response caching
- **Background Jobs**: Bull Queue for SHAB data scraping and processing

### Infrastructure
- **Hosting**: DigitalOcean or Hetzner (Swiss/German data centers)
- **CDN**: CloudFlare for global performance and DDoS protection  
- **Monitoring**: Sentry for error tracking, PostHog for user analytics
- **CI/CD**: GitHub Actions for automated testing and deployment

## API Design

### RESTful Endpoints
- **GET /api/auctions**: List auctions with filtering and pagination
- **GET /api/auctions/:id**: Get auction details with related objects
- **GET /api/objects**: List property objects with geographic and filter queries
- **POST /api/search**: Advanced search with saved search functionality (Free Account Phase)

### Real-time Features
- WebSocket connections for real-time map updates
- Server-sent events for auction status changes
- Progressive loading for map viewport changes

### Authentication & Authorization
- JWT-based authentication for registered users (Free Account Phase)
- Role-based access control for premium features (Paid Subscription Phase)
- API rate limiting and usage tracking

## Performance Considerations

### Database Optimization
- Spatial indexing on objects(latitude, longitude) for map queries
- Composite indexes on filtering columns (property_type, estimated_value, auction_date)
- Partial indexes for active auctions to improve query performance
- Connection pooling and query optimization

### Caching Strategy
- Redis caching for frequently accessed auction data
- Map tile caching for improved geographic performance
- API response caching with invalidation on data updates
- Browser caching for static assets and map resources

### Scalability Planning
- Horizontal scaling capability for API servers
- Database read replicas for query performance
- CDN distribution for global map tile delivery
- Background job processing separation for data pipeline isolation

## Security & Compliance

### Data Protection
- GDPR compliance for EU users
- Swiss data protection requirements
- Secure API endpoints with rate limiting
- Input validation and sanitization

### System Security
- SSL/TLS encryption for all communications
- Secure database connections and access controls
- Regular security audits and dependency updates
- Backup and disaster recovery procedures

## Monitoring & Observability

### Application Monitoring
- Error tracking with Sentry integration
- Performance monitoring for API response times
- User analytics with PostHog for feature usage
- Custom dashboards for business metrics

### System Health
- Database performance monitoring
- SHAB API availability and response time tracking
- Background job success rates and error handling
- Infrastructure resource utilization monitoring

---

**Last Updated**: 2025-09-02  
**Document Version**: 1.0  
**Related Documents**: 
- `auctiondeal_prd.md` - Product Requirements Document
- `auctiondeal_decisions.md` - Decision Tracking Log