# AuctionDeal Architecture Diagrams

## System Context Diagram

```mermaid
graph TB
    subgraph "External Systems"
        SHAB[SHAB XML API<br/>Swiss Commercial Gazette]
        LLM[LLM Service<br/>OpenAI/Anthropic]
        OSM[OpenStreetMap<br/>Map Tiles]
    end
    
    subgraph "Users"
        INV[Property Investors]
        BUY[Property Buyers]  
        SME[Real Estate SMEs]
    end
    
    subgraph "AuctionDeal Platform"
        WEB[Web Application]
        API[REST API]
        PROC[Processing Pipeline]
        DB[(PostgreSQL + PostGIS)]
        CACHE[(Redis Cache)]
    end
    
    INV --> WEB
    BUY --> WEB
    SME --> WEB
    
    WEB --> API
    API --> DB
    API --> CACHE
    
    PROC --> SHAB
    PROC --> LLM
    PROC --> DB
    
    WEB --> OSM
    
    classDef external fill:#e1f5fe
    classDef user fill:#f3e5f5
    classDef platform fill:#e8f5e8
    
    class SHAB,LLM,OSM external
    class INV,BUY,SME user
    class WEB,API,PROC,DB,CACHE platform
```

## Container Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Next.js Web App<br/>TypeScript, React<br/>Leaflet Maps, Tailwind]
    end
    
    subgraph "Application Layer"
        API[REST API<br/>Express/Next.js API]
        SCHEDULER[Background Scheduler<br/>Daily SHAB Sync]
    end
    
    subgraph "Processing Layer"
        LANG[Language Detection<br/>Service]
        CLASS[Property Classification<br/>LLM Service]
        VAL[Value Extraction<br/>Service]
        GEO[Geolocation<br/>Service]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL 15+<br/>PostGIS Extension)]
        CACHE[(Redis Cache<br/>Viewport Queries)]
        EVENTS[(Event Store<br/>Processing Audit)]
    end
    
    subgraph "External"
        SHAB[SHAB XML API]
        LLMAPI[LLM API<br/>OpenAI/Anthropic]
    end
    
    WEB --> API
    API --> DB
    API --> CACHE
    
    SCHEDULER --> SHAB
    SCHEDULER --> LANG
    LANG --> CLASS
    CLASS --> VAL
    VAL --> GEO
    GEO --> DB
    
    CLASS --> LLMAPI
    VAL --> LLMAPI
    LANG --> LLMAPI
    
    SCHEDULER --> EVENTS
    CLASS --> EVENTS
    VAL --> EVENTS
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant S as SHAB API
    participant SCHED as Daily Scheduler
    participant LANG as Language Detector
    participant LLM as LLM Service
    participant DB as Database
    participant CACHE as Redis Cache
    participant WEB as Web Interface
    participant USER as User

    Note over S,USER: Daily Processing Pipeline
    
    SCHED->>S: Fetch daily publications (16:00 CET)
    S->>SCHED: XML auction data
    SCHED->>DB: Store raw SHAB data
    
    SCHED->>LLM: Route by official language from XML (DE/FR/IT)
    LLM->>DB: Store classified properties
    
    Note over S,USER: User Interaction Flow
    
    USER->>WEB: Load map interface
    WEB->>CACHE: Check cached viewport data
    alt Cache Hit
        CACHE->>WEB: Return cached properties
    else Cache Miss
        WEB->>DB: Query properties in viewport
        DB->>WEB: Property results
        WEB->>CACHE: Cache results (5 min TTL)
    end
    WEB->>USER: Display property pins
    
    USER->>WEB: Apply filters
    WEB->>DB: Filtered query
    DB->>WEB: Filtered results
    WEB->>USER: Update map display
    
    USER->>WEB: Click property pin
    WEB->>DB: Get property details
    DB->>WEB: Full property data
    WEB->>USER: Show property detail page
```

## Component Architecture Diagram

```mermaid
graph TB
    subgraph "Presentation Layer"
        MAP[Interactive Map<br/>Leaflet + OSM]
        FILTER[Filter Controls<br/>Property Types, Price, Region]
        CARDS[Property Cards<br/>List View]
        DETAIL[Property Detail<br/>Full Information]
    end
    
    subgraph "Application Services"
        SEARCH[Property Search Service<br/>Viewport + Filter Queries]
        AUCTION[Auction Data Service<br/>SHAB Synchronization]
        PROC[Property Processing Service<br/>Classification Pipeline]
    end
    
    subgraph "Domain Models"
        PROP[Property Aggregate<br/>Classification + Location]
        AUCT[Auction Aggregate<br/>SHAB Data + Objects]
        SESS[Search Session<br/>Viewport + Filters]
    end
    
    subgraph "Infrastructure"
        REPO[Repository Layer<br/>Database Abstraction]
        EXT[External Adapters<br/>SHAB API, LLM API]
        CACHE_LAYER[Caching Layer<br/>Redis Operations]
    end
    
    MAP --> SEARCH
    FILTER --> SEARCH
    CARDS --> SEARCH
    DETAIL --> SEARCH
    
    SEARCH --> PROP
    SEARCH --> SESS
    AUCTION --> AUCT
    PROC --> PROP
    
    PROP --> REPO
    AUCT --> REPO
    SESS --> CACHE_LAYER
    
    AUCTION --> EXT
    PROC --> EXT
    REPO --> DB[(Database)]
    CACHE_LAYER --> REDIS[(Redis)]
```

## Multi-Language Processing Architecture

```mermaid
flowchart TD
    START([SHAB XML Input]) --> PARSE[XML Parser<br/>Extract Auction Objects + Metadata]
    
    PARSE --> ROUTE{Route by Official Language<br/>from XML metadata}
    
    ROUTE -->|German| DE_PROC[German Processor<br/>Specialized Prompts]
    ROUTE -->|French| FR_PROC[French Processor<br/>Specialized Prompts]
    ROUTE -->|Italian| IT_PROC[Italian Processor<br/>Specialized Prompts]
    
    DE_PROC --> DE_CLASS[German Classification<br/>Wohnung, EFH, MFH, etc.]
    FR_PROC --> FR_CLASS[French Classification<br/>Appartement, Maison, etc.]
    IT_PROC --> IT_CLASS[Italian Classification<br/>Appartamento, Casa, etc.]
    
    DE_CLASS --> UNIFY[Unified Property Types<br/>Standard Enum Values]
    FR_CLASS --> UNIFY
    IT_CLASS --> UNIFY
    
    UNIFY --> VALUE[Value Extraction<br/>Language-Aware CHF Parsing]
    
    VALUE --> LOCATION[Location Standardization<br/>Swiss Address Format]
    
    LOCATION --> STORE[(Store in Database<br/>With Language Metadata)]
    
    STORE --> INDEX[Spatial Indexing<br/>PostGIS Optimization]
    
    INDEX --> READY([Ready for Map Display])
    
    classDef process fill:#e8f4fd
    classDef decision fill:#fff2cc
    classDef storage fill:#d5e8d4
    
    class PARSE,DETECT,DE_PROC,FR_PROC,IT_PROC,DE_CLASS,FR_CLASS,IT_CLASS,UNIFY,VALUE,LOCATION,INDEX process
    class ROUTE decision
    class STORE,READY storage
```

## Database Entity Relationship Diagram

```mermaid
erDiagram
    SHAB_PUBLICATIONS ||--o{ AUCTIONS : contains
    AUCTIONS ||--o{ AUCTION_OBJECTS : has
    AUCTION_OBJECTS ||--|| PROPERTIES : processed_into
    
    SHAB_PUBLICATIONS {
        varchar id PK
        date publish_date
        text xml_content
        varchar canton
        varchar detected_language
        varchar processing_status
        timestamp created_at
        timestamp processed_at
    }
    
    AUCTIONS {
        uuid id PK
        varchar shab_publication_id FK
        timestamp auction_date
        text auction_location
        varchar status
        jsonb contact_info
        timestamp created_at
        timestamp updated_at
    }
    
    AUCTION_OBJECTS {
        uuid id PK
        uuid auction_id FK
        text raw_text
        integer object_order
        timestamp created_at
    }
    
    PROPERTIES {
        uuid id PK
        uuid auction_object_id FK
        varchar property_type
        decimal estimated_value_chf
        decimal estimated_value_confidence
        text address
        geometry coordinates
        varchar canton
        text municipality
        varchar source_language
        decimal classification_confidence
        timestamp created_at
        timestamp updated_at
    }
```

## Deployment Architecture Diagram

```mermaid
graph TB
    subgraph "CDN Layer"
        CDN[Vercel CDN<br/>Global Edge Locations]
    end
    
    subgraph "Application Layer"
        WEB[Next.js Application<br/>Vercel Serverless Functions]
        SCHEDULER[Background Jobs<br/>Vercel Cron Jobs]
    end
    
    subgraph "Data Layer"  
        POSTGRES[(Vercel Postgres<br/>Primary Database)]
        REDIS[(Vercel KV<br/>Redis Cache)]
    end
    
    subgraph "External Services"
        SHAB_API[SHAB XML API<br/>shab.ch]
        LLM_API[LLM Service<br/>OpenAI API]
        MAP_TILES[OpenStreetMap<br/>Tile Servers]
    end
    
    subgraph "Monitoring"
        ANALYTICS[Vercel Analytics<br/>Performance Monitoring]
        LOGS[Vercel Logs<br/>Error Tracking]
    end
    
    USER([Users]) --> CDN
    CDN --> WEB
    
    WEB --> POSTGRES
    WEB --> REDIS
    WEB --> MAP_TILES
    
    SCHEDULER --> SHAB_API
    SCHEDULER --> LLM_API
    SCHEDULER --> POSTGRES
    
    WEB --> ANALYTICS
    WEB --> LOGS
    SCHEDULER --> LOGS
    
    classDef external fill:#ffe6cc
    classDef vercel fill:#f0f0f0
    classDef data fill:#d4edda
    
    class SHAB_API,LLM_API,MAP_TILES external
    class CDN,WEB,SCHEDULER,ANALYTICS,LOGS vercel
    class POSTGRES,REDIS data
```

These diagrams provide visual representation of the AuctionDeal system architecture from different perspectives, supporting the implementation team with clear technical guidance.