# AuctionDeal Implementation Plan

## Overview

This implementation plan aligns directly with PRD user stories and includes complete technical infrastructure setup at each phase. Each phase is designed to be implementable using SuperClaude's `/sc:implement` command with clear technical requirements and scalable architecture.

---

## Phase 0: Development Environment Setup (Week 1)

### Technical Infrastructure Foundation
**Goal**: Establish complete development environment and CI/CD pipeline

#### 0.1 Local Development Setup
**Technical Components**:
```bash
# Required tools and setup
- Node.js 18+ with npm/yarn
- Docker Desktop for local PostgreSQL + PostGIS
- Git with proper SSH keys
- VSCode with recommended extensions
```

**Implementation Tasks**:
- [ ] **Project Initialization**
  ```bash
  # Initialize Next.js 14 with TypeScript
  npx create-next-app@latest auctiondeal --typescript --tailwind --eslint --app
  cd auctiondeal
  
  # Install required dependencies
  npm install @prisma/client prisma
  npm install @types/leaflet leaflet react-leaflet
  npm install @vercel/postgres @vercel/kv
  npm install zod @hookform/react-hook-form
  ```

- [ ] **Docker Development Environment**
  ```yaml
  # docker-compose.dev.yml
  version: '3.8'
  services:
    postgres:
      image: postgis/postgis:15-3.3
      environment:
        POSTGRES_DB: auctiondeal_dev
        POSTGRES_USER: dev
        POSTGRES_PASSWORD: devpassword
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data
    
    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      volumes:
        - redis_data:/data
  
  volumes:
    postgres_data:
    redis_data:
  ```

- [ ] **Environment Configuration**
  ```bash
  # .env.local setup
  DATABASE_URL="postgresql://dev:devpassword@localhost:5432/auctiondeal_dev"
  REDIS_URL="redis://localhost:6379"
  NEXTAUTH_SECRET="development-secret-change-in-production"
  OPENAI_API_KEY="your-openai-key"
  ```

**Success Criteria**: 
- Local development server runs without errors
- Database connection established
- Hot reload working
- Docker containers running stable

---

## Phase 1: Database Foundation & SHAB Pipeline (Week 2-3)

### User Stories Implemented:
- **Story 1.1**: Initial Database Setup
- **Story 1.3**: Daily SHAB API Synchronization  
- **Story 1.2**: Historical Data Backfill

#### 1.1 Database Schema Implementation
**Technical Components**:
```sql
-- Database schema with PostGIS spatial support
-- Prisma schema.prisma configuration
-- Database migrations and seeding
```

**Implementation Tasks**:
- [ ] **Prisma Setup & Schema Design**
  ```bash
  # Initialize Prisma
  npx prisma init
  
  # Configure schema.prisma with PostGIS support
  npm install prisma-extension-postgis
  ```

  ```prisma
  // prisma/schema.prisma
  generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["postgresqlExtensions"]
  }

  datasource db {
    provider   = "postgresql"
    url        = env("DATABASE_URL")
    extensions = [postgis]
  }

  model ShabPublication {
    id                  String   @id
    publishDate         DateTime
    xmlContent          String
    canton              String
    rubric              String
    subRubric           String
    officialLanguage    String
    processingStatus    String   @default("pending")
    createdAt           DateTime @default(now())
    processedAt         DateTime?
    
    auctions            Auction[]
  }

  model Auction {
    id                  String   @id @default(cuid())
    shabPublicationId   String
    auctionDate         DateTime
    auctionLocation     String
    status              String   @default("published")
    createdAt           DateTime @default(now())
    updatedAt           DateTime @updatedAt
    
    shabPublication     ShabPublication @relation(fields: [shabPublicationId], references: [id])
    auctionObjects      AuctionObject[]
  }

  model AuctionObject {
    id            String   @id @default(cuid())
    auctionId     String
    rawText       String
    objectOrder   Int
    createdAt     DateTime @default(now())
    
    auction       Auction    @relation(fields: [auctionId], references: [id], onDelete: Cascade)
    property      Property?
  }

  model Property {
    id                        String    @id @default(cuid())
    auctionObjectId           String    @unique
    propertyType              String
    classificationConfidence  Decimal?
    estimatedValueChf         Decimal?
    valueConfidence           Decimal?
    address                   String?
    coordinates               Unsupported("geometry(Point, 4326)")?
    canton                    String?
    municipality              String?
    sourceLanguage            String
    createdAt                 DateTime  @default(now())
    updatedAt                 DateTime  @updatedAt
    
    auctionObject             AuctionObject @relation(fields: [auctionObjectId], references: [id], onDelete: Cascade)
    
    @@index([propertyType, canton])
    @@index([estimatedValueChf])
    @@index([coordinates], type: Gist)
  }
  ```

- [ ] **Database Migration & PostGIS Setup**
  ```bash
  # Run migrations
  npx prisma migrate dev --name init
  
  # Generate Prisma client
  npx prisma generate
  
  # Create spatial indexes manually (PostGIS)
  psql $DATABASE_URL -c "CREATE INDEX CONCURRENTLY idx_properties_coordinates ON \"Property\" USING GIST (coordinates);"
  ```

**Acceptance Criteria Met**:
- ✅ Database schema created with tables: auctions, objects, shab_publications
- ✅ Foreign key constraints established between tables
- ✅ Indexes created for performance optimization  
- ✅ Data validation rules implemented

#### 1.2 SHAB API Integration
**Technical Components**:
```typescript
// SHAB API client with XML parsing
// Error handling and retry logic  
// Scheduled job configuration
```

**Implementation Tasks**:
- [ ] **SHAB API Client Service**
  ```typescript
  // src/lib/services/shab-api.ts
  import { XMLParser } from 'fast-xml-parser';
  
  interface ShabApiClient {
    fetchDailyPublications(date: Date): Promise<ShabPublication[]>;
    fetchHistoricalPublications(fromDate: Date, toDate: Date): Promise<ShabPublication[]>;
  }
  
  class ShabApiService implements ShabApiClient {
    private xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    
    async fetchDailyPublications(date: Date): Promise<ShabPublication[]> {
      // Implementation with error handling and retries
    }
  }
  ```

- [ ] **Scheduled Processing Jobs**
  ```typescript
  // src/app/api/cron/shab-sync/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import { ShabApiService } from '@/lib/services/shab-api';
  
  export async function GET(request: NextRequest) {
    // Daily sync job implementation
    // Runs at 16:00 CET via Vercel Cron
  }
  ```

- [ ] **Vercel Cron Configuration**
  ```json
  // vercel.json
  {
    "crons": [
      {
        "path": "/api/cron/shab-sync",
        "schedule": "0 16 * * *"
      }
    ]
  }
  ```

**Acceptance Criteria Met**:
- ✅ Daily automated synchronization with SHAB API
- ✅ New auction listings appear within 2 hours of publication
- ✅ System handles API failures gracefully  
- ✅ Duplicate publications prevented

#### 1.3 Historical Data Backfill
**Technical Components**:
```bash
# Backfill script for 90-day historical data
# Batch processing with progress tracking
# Data quality validation pipeline
```

**Implementation Tasks**:
- [ ] **Historical Data Import Script**
  ```typescript
  // scripts/historical-backfill.ts
  import { PrismaClient } from '@prisma/client';
  import { ShabApiService } from '../src/lib/services/shab-api';
  
  async function backfillHistoricalData() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    // Batch processing with progress tracking
    // Data validation and quality checks
  }
  ```

- [ ] **Data Quality Dashboard**
  ```typescript
  // src/app/admin/data-quality/page.tsx
  // Admin interface for monitoring data quality
  // Charts showing processing status, error rates
  ```

**Acceptance Criteria Met**:
- ✅ 90 days of historical auction data available at launch
- ✅ All historical records properly parsed and structured
- ✅ Data quality validation completed
- ✅ Raw data preserved for future reprocessing

---

## Phase 2: Property Intelligence Pipeline (Week 4-5)

### User Stories Implemented:
- **Story 1.4**: LLM-Powered Property Classification
- **Story 1.5**: Auction Status Monitoring

#### 2.1 LLM Processing Infrastructure
**Technical Components**:
```typescript
// OpenAI/Anthropic API integration
// Multi-language prompt templates
// Confidence scoring and validation
// Processing queue with Redis
```

**Implementation Tasks**:
- [ ] **LLM Service Architecture**
  ```typescript
  // src/lib/services/llm-processing.ts
  import OpenAI from 'openai';
  
  interface PropertyClassificationResult {
    propertyType: PropertyType;
    confidence: number;
    extractedValue?: number;
    valueConfidence?: number;
    location?: string;
  }
  
  class LLMProcessingService {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    async classifyProperty(
      text: string, 
      language: 'de' | 'fr' | 'it'
    ): Promise<PropertyClassificationResult> {
      const prompt = this.getPromptForLanguage(language);
      // Implementation with structured output parsing
    }
    
    private getPromptForLanguage(language: string): string {
      const prompts = {
        de: `Klassifiziere diese deutsche Auktionsbeschreibung...`,
        fr: `Classifiez cette description d'enchère française...`,
        it: `Classifica questa descrizione d'asta italiana...`
      };
      return prompts[language];
    }
  }
  ```

- [ ] **Processing Queue with Redis**
  ```typescript
  // src/lib/services/processing-queue.ts
  import { Redis } from '@vercel/kv';
  
  class ProcessingQueue {
    async addToQueue(auctionObjectId: string): Promise<void> {
      await Redis.lpush('processing-queue', auctionObjectId);
    }
    
    async processNext(): Promise<void> {
      const auctionObjectId = await Redis.rpop('processing-queue');
      if (auctionObjectId) {
        await this.processAuctionObject(auctionObjectId);
      }
    }
  }
  ```

- [ ] **Background Processing Worker**
  ```typescript
  // src/app/api/cron/process-queue/route.ts
  // Runs every 5 minutes to process queued items
  ```

**Acceptance Criteria Met**:
- ✅ 95%+ accuracy in property type classification
- ✅ Estimated value extraction from auction text
- ✅ Property location identification and standardization
- ✅ Confidence scoring for extracted data

#### 2.2 Geocoding and Location Services
**Technical Components**:
```typescript
// OpenStreetMap Nominatim integration
// Swiss address parsing and validation
// PostGIS coordinate storage
```

**Implementation Tasks**:
- [ ] **Geocoding Service**
  ```typescript
  // src/lib/services/geocoding.ts
  interface GeocodeResult {
    coordinates: [number, number]; // [lat, lng]
    formattedAddress: string;
    canton: string;
    municipality: string;
    confidence: number;
  }
  
  class GeocodingService {
    async geocodeSwissAddress(address: string): Promise<GeocodeResult> {
      // Nominatim API integration with Swiss bounds validation
    }
    
    private validateSwissCoordinates(lat: number, lng: number): boolean {
      // Switzerland bounds: approximately 45.8-47.8 lat, 5.9-10.5 lng
      return lat >= 45.8 && lat <= 47.8 && lng >= 5.9 && lng <= 10.5;
    }
  }
  ```

**Success Criteria**: >85% successful geocoding, all coordinates within Switzerland bounds

---

## Phase 3: Interactive Map Interface (Week 6-7)

### User Stories Implemented:
- **Story 2.1**: Switzerland Map with Property Pins
- **Story 2.2**: Property Pin Interactions  
- **Story 2.3**: Map Navigation and Zoom

#### 3.1 Map Component Infrastructure
**Technical Components**:
```typescript
// React Leaflet integration
// Custom pin components with clustering
// Map state management with Zustand
```

**Implementation Tasks**:
- [ ] **Map Component Setup**
  ```bash
  # Install map dependencies
  npm install leaflet react-leaflet @types/leaflet
  npm install react-leaflet-cluster
  npm install zustand # for map state management
  ```

  ```typescript
  // src/components/map/SwissMap.tsx
  'use client';
  import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
  import MarkerClusterGroup from 'react-leaflet-cluster';
  
  interface SwissMapProps {
    properties: Property[];
    onViewportChange: (bounds: ViewportBounds) => void;
    selectedProperty?: string;
  }
  
  export function SwissMap({ properties, onViewportChange }: SwissMapProps) {
    const SWITZERLAND_CENTER = [46.8182, 8.2275] as [number, number];
    const SWITZERLAND_BOUNDS = [
      [45.8, 5.9],
      [47.8, 10.5]
    ] as [[number, number], [number, number]];
    
    return (
      <MapContainer
        center={SWITZERLAND_CENTER}
        zoom={8}
        className="h-full w-full"
        maxBounds={SWITZERLAND_BOUNDS}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <MarkerClusterGroup>
          {properties.map(property => (
            <PropertyPin key={property.id} property={property} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    );
  }
  ```

- [ ] **Custom Property Pin Component**
  ```typescript
  // src/components/map/PropertyPin.tsx
  import { Marker, Popup } from 'react-leaflet';
  import { divIcon } from 'leaflet';
  
  const PIN_COLORS = {
    Land: '#4ade80',      // Green
    MFH: '#3b82f6',       // Blue  
    EFH: '#93c5fd',       // Light blue
    Commercial: '#8b5cf6', // Violet
    Wohnung: '#fb923c',   // Orange
    Parking: '#ffffff',   // White
    Misc: '#fbbf24'       // Yellow
  } as const;
  
  interface PropertyPinProps {
    property: Property;
    onClick?: (property: Property) => void;
  }
  
  export function PropertyPin({ property, onClick }: PropertyPinProps) {
    const pinColor = PIN_COLORS[property.propertyType];
    
    const customIcon = divIcon({
      html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${pinColor}"></div>`,
      iconSize: [16, 16],
      className: 'custom-property-pin'
    });
    
    return (
      <Marker
        position={[property.coordinates.lat, property.coordinates.lng]}
        icon={customIcon}
        eventHandlers={{
          click: () => onClick?.(property)
        }}
      >
        <Popup>
          <PropertyPreviewCard property={property} />
        </Popup>
      </Marker>
    );
  }
  ```

- [ ] **Map State Management**
  ```typescript
  // src/stores/map-store.ts
  import { create } from 'zustand';
  
  interface MapState {
    viewport: ViewportBounds;
    selectedProperty: string | null;
    visibleProperties: Property[];
    setViewport: (viewport: ViewportBounds) => void;
    setSelectedProperty: (id: string | null) => void;
    setVisibleProperties: (properties: Property[]) => void;
  }
  
  export const useMapStore = create<MapState>((set) => ({
    viewport: {
      northEast: { lat: 47.8, lng: 10.5 },
      southWest: { lat: 45.8, lng: 5.9 }
    },
    selectedProperty: null,
    visibleProperties: [],
    setViewport: (viewport) => set({ viewport }),
    setSelectedProperty: (selectedProperty) => set({ selectedProperty }),
    setVisibleProperties: (visibleProperties) => set({ visibleProperties })
  }));
  ```

**Acceptance Criteria Met**:
- ✅ Switzerland map as default view with appropriate zoom level
- ✅ Color-coded pins by property type with exact colors specified
- ✅ Pin clustering for dense areas with zoom-in behavior
- ✅ Responsive map interface for desktop and mobile

#### 3.2 Viewport API Implementation
**Technical Components**:
```typescript
// PostGIS spatial queries for viewport bounds
// Efficient property loading with pagination
// Redis caching for frequent queries
```

**Implementation Tasks**:
- [ ] **Viewport Query API**
  ```typescript
  // src/app/api/properties/viewport/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import { PrismaClient } from '@prisma/client';
  
  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const bounds = {
      ne_lat: parseFloat(searchParams.get('ne_lat')!),
      ne_lng: parseFloat(searchParams.get('ne_lng')!),
      sw_lat: parseFloat(searchParams.get('sw_lat')!),
      sw_lng: parseFloat(searchParams.get('sw_lng')!)
    };
    
    // PostGIS spatial query
    const properties = await prisma.$queryRaw`
      SELECT p.*, a.auction_date, a.auction_location, a.status
      FROM "Property" p
      JOIN "AuctionObject" ao ON p.auction_object_id = ao.id
      JOIN "Auction" a ON ao.auction_id = a.id
      WHERE ST_Within(
        p.coordinates,
        ST_MakeEnvelope(${bounds.sw_lng}, ${bounds.sw_lat}, ${bounds.ne_lng}, ${bounds.ne_lat}, 4326)
      )
      AND a.status = 'published'
      AND a.auction_date >= NOW()
      ORDER BY a.auction_date ASC
      LIMIT 1000
    `;
    
    return NextResponse.json({ properties });
  }
  ```

**Success Criteria**: Map loads in <1 second, viewport queries <300ms response time

---

## Phase 4: Property Filtering System (Week 8-9)

### User Stories Implemented:
- **Story 3.1**: Property Type Filtering
- **Story 3.2**: Price Range Filtering
- **Story 3.3**: Geographic Filtering  
- **Story 3.4**: Filter Session Memory

#### 4.1 Filter Components & State Management
**Technical Components**:
```typescript
// Filter UI components with React Hook Form
// URL synchronization with Next.js router
// localStorage persistence
```

**Implementation Tasks**:
- [ ] **Filter Form Components**
  ```typescript
  // src/components/filters/PropertyFilters.tsx
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  
  const FilterSchema = z.object({
    propertyTypes: z.array(z.enum(['Land', 'EFH', 'MFH', 'Wohnung', 'Commercial', 'Parking', 'Misc'])),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    cantons: z.array(z.string()),
    includeWithoutValues: z.boolean()
  });
  
  type FilterFormData = z.infer<typeof FilterSchema>;
  
  export function PropertyFilters() {
    const { register, handleSubmit, watch } = useForm<FilterFormData>({
      resolver: zodResolver(FilterSchema),
      defaultValues: {
        propertyTypes: [],
        cantons: [],
        includeWithoutValues: true
      }
    });
    
    // Real-time filter updates
    const watchedFilters = watch();
    useEffect(() => {
      onFiltersChange(watchedFilters);
    }, [watchedFilters]);
    
    return (
      <form className="space-y-6">
        <PropertyTypeFilter register={register} />
        <PriceRangeFilter register={register} />
        <CantonFilter register={register} />
      </form>
    );
  }
  ```

- [ ] **Swiss CHF Price Range Slider**
  ```typescript
  // src/components/filters/PriceRangeFilter.tsx
  import * as Slider from '@radix-ui/react-slider';
  
  function formatSwissCHF(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}mio`;
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)}k`;
    }
    return amount.toString();
  }
  
  export function PriceRangeFilter({ register }: { register: any }) {
    const [range, setRange] = useState([0, 5000000]);
    
    return (
      <div className="space-y-4">
        <label className="text-sm font-medium">Preisbereich</label>
        <div className="px-3">
          <Slider.Root
            value={range}
            onValueChange={setRange}
            max={5000000}
            min={0}
            step={50000}
            className="relative flex items-center w-full h-5"
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg border-2 border-blue-500 rounded-full" />
            <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg border-2 border-blue-500 rounded-full" />
          </Slider.Root>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>CHF {formatSwissCHF(range[0])}</span>
          <span>CHF {formatSwissCHF(range[1])}</span>
        </div>
      </div>
    );
  }
  ```

**Acceptance Criteria Met**:
- ✅ Swiss CHF formatting (950k for under 1M, 1.25mio for over 1M)
- ✅ Multi-select filtering capability for property types and cantons
- ✅ Real-time map pin updates based on selected filters
- ✅ Filter persistence across page navigation

#### 4.2 Advanced Filtering API
**Technical Components**:
```sql
-- Optimized database queries with multiple indexes
-- Efficient filtering with PostGIS spatial queries
-- Redis caching for filter combinations
```

**Implementation Tasks**:
- [ ] **Advanced Filter API Endpoint**
  ```typescript
  // src/app/api/properties/search/route.ts
  export async function POST(request: NextRequest) {
    const { viewport, filters, sort } = await request.json();
    
    const whereConditions = [];
    const parameters = [];
    
    // Build dynamic query based on filters
    if (filters.propertyTypes?.length > 0) {
      whereConditions.push(`p.property_type = ANY($${parameters.length + 1})`);
      parameters.push(filters.propertyTypes);
    }
    
    if (filters.priceRange) {
      if (filters.priceRange.min) {
        whereConditions.push(`p.estimated_value_chf >= $${parameters.length + 1}`);
        parameters.push(filters.priceRange.min);
      }
      if (filters.priceRange.max) {
        whereConditions.push(`p.estimated_value_chf <= $${parameters.length + 1}`);
        parameters.push(filters.priceRange.max);
      }
    }
    
    // Spatial viewport filter
    if (viewport) {
      whereConditions.push(`ST_Within(p.coordinates, ST_MakeEnvelope($${parameters.length + 1}, $${parameters.length + 2}, $${parameters.length + 3}, $${parameters.length + 4}, 4326))`);
      parameters.push(viewport.southWest.lng, viewport.southWest.lat, viewport.northEast.lng, viewport.northEast.lat);
    }
    
    const query = `
      SELECT p.*, a.auction_date, a.auction_location, a.status
      FROM "Property" p
      JOIN "AuctionObject" ao ON p.auction_object_id = ao.id
      JOIN "Auction" a ON ao.auction_id = a.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY a.auction_date ASC
      LIMIT 1000
    `;
    
    const properties = await prisma.$queryRaw(query, ...parameters);
    return NextResponse.json({ properties });
  }
  ```

**Success Criteria**: Filter response time <300ms, accurate property counts

---

## Phase 5: Property Details & List Views (Week 10-11)

### User Stories Implemented:
- **Story 4.1**: Complete Auction Information Display
- **Story 4.2**: SEO-Friendly Property URLs
- **Story 5.1**: Map-Synchronized Property List
- **Story 5.2**: Property Card Display  
- **Story 5.3**: List Sorting and Layout

#### 5.1 Property Detail Pages
**Technical Components**:
```typescript
// Next.js 14 App Router with dynamic routes
// Server-side rendering for SEO
// Structured data markup
```

**Implementation Tasks**:
- [ ] **Dynamic Property Routes**
  ```typescript
  // src/app/properties/[id]/page.tsx
  import { Metadata } from 'next';
  import { notFound } from 'next/navigation';
  
  interface PropertyPageProps {
    params: { id: string };
  }
  
  async function getProperty(id: string): Promise<PropertyDetail | null> {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        auctionObject: {
          include: {
            auction: {
              include: {
                shabPublication: true
              }
            }
          }
        }
      }
    });
    
    return property;
  }
  
  export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
    const property = await getProperty(params.id);
    
    if (!property) return { title: 'Property Not Found' };
    
    return {
      title: `${property.propertyType} in ${property.municipality} - CHF ${property.estimatedValueChf?.toLocaleString()}`,
      description: `Zwangsversteigerung: ${property.propertyType} in ${property.address}. Schätzwert: CHF ${property.estimatedValueChf?.toLocaleString()}. Auktion am ${new Date(property.auctionObject.auction.auctionDate).toLocaleDateString('de-CH')}.`,
      openGraph: {
        title: `${property.propertyType} - CHF ${property.estimatedValueChf?.toLocaleString()}`,
        description: `Zwangsversteigerung in ${property.municipality}`,
        type: 'website'
      }
    };
  }
  
  export default async function PropertyPage({ params }: PropertyPageProps) {
    const property = await getProperty(params.id);
    
    if (!property) {
      notFound();
    }
    
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstate',
              'name': `${property.propertyType} in ${property.municipality}`,
              'address': property.address,
              'offers': {
                '@type': 'Offer',
                'price': property.estimatedValueChf,
                'priceCurrency': 'CHF'
              }
            })
          }}
        />
        <PropertyDetailView property={property} />
      </>
    );
  }
  ```

- [ ] **Property Detail Component**
  ```typescript
  // src/components/property/PropertyDetailView.tsx
  export function PropertyDetailView({ property }: { property: PropertyDetail }) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Mobile-optimized layout with priority information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PropertyHeader property={property} />
            <AuctionDetails auction={property.auctionObject.auction} />
            <LegalRequirements requirements={property.legalRequirements} />
          </div>
          <div>
            <PropertyMap coordinates={property.coordinates} />
            <ConfidenceIndicators 
              classificationConfidence={property.classificationConfidence}
              valueConfidence={property.valueConfidence}
            />
          </div>
        </div>
      </div>
    );
  }
  ```

**Acceptance Criteria Met**:
- ✅ Display estimated value with confidence indicators
- ✅ Show auction dates, times, and locations
- ✅ SEO-friendly URL structure for each property
- ✅ Meta tags and structured data for search engines

#### 5.2 Property List Components
**Technical Components**:
```typescript
// Synchronized list-map components
// Virtual scrolling for performance
// Real-time updates with WebSocket/polling
```

**Implementation Tasks**:
- [ ] **Property List with Map Sync**
  ```typescript
  // src/components/property/PropertyList.tsx
  import { useMapStore } from '@/stores/map-store';
  import { useVirtualizer } from '@tanstack/react-virtual';
  
  export function PropertyList() {
    const { visibleProperties, selectedProperty, setSelectedProperty } = useMapStore();
    const parentRef = useRef<HTMLDivElement>(null);
    
    const rowVirtualizer = useVirtualizer({
      count: visibleProperties.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 200,
      overscan: 5
    });
    
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            {visibleProperties.length} properties in current view
          </h3>
          <PropertySortControls />
        </div>
        
        <div ref={parentRef} className="flex-1 overflow-auto">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const property = visibleProperties[virtualItem.index];
              return (
                <div
                  key={property.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`
                  }}
                >
                  <PropertyCard 
                    property={property}
                    isSelected={property.id === selectedProperty}
                    onClick={() => setSelectedProperty(property.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  ```

**Acceptance Criteria Met**:
- ✅ Real-time synchronization with map viewport bounds
- ✅ Property cards show address, estimated value, auction date, property type
- ✅ Default sorting by auction date (soonest first)
- ✅ Responsive card layout (grid on desktop, stack on mobile)

**Success Criteria**: Property detail pages load in <500ms, list-map synchronization instant

---

## Phase 6: Production Deployment & Monitoring (Week 12)

### Production Infrastructure Setup

#### 6.1 Vercel Production Deployment
**Technical Components**:
```bash
# Production environment configuration
# Database migration pipeline
# Environment variable management
# CDN and edge functions
```

**Implementation Tasks**:
- [ ] **Production Environment Setup**
  ```bash
  # Vercel deployment configuration
  # vercel.json
  {
    "build": {
      "env": {
        "DATABASE_URL": "@database-url-production",
        "REDIS_URL": "@redis-url-production",
        "OPENAI_API_KEY": "@openai-api-key"
      }
    },
    "functions": {
      "app/api/**": {
        "maxDuration": 30
      }
    }
  }
  ```

- [ ] **Production Database Setup**
  ```bash
  # Vercel Postgres setup
  vercel env add DATABASE_URL
  vercel env add REDIS_URL
  
  # Run production migrations
  npx prisma migrate deploy
  npx prisma generate
  ```

#### 6.2 Monitoring & Analytics
**Technical Components**:
```typescript
// Vercel Analytics integration
// Error tracking with Sentry
// Performance monitoring
// GDPR-compliant user analytics
```

**Implementation Tasks**:
- [ ] **Analytics & Monitoring Setup**
  ```typescript
  // src/app/layout.tsx
  import { Analytics } from '@vercel/analytics/react';
  import { SpeedInsights } from '@vercel/speed-insights/next';
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="de">
        <body>
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    );
  }
  ```

- [ ] **Error Tracking**
  ```bash
  npm install @sentry/nextjs
  
  # Configure Sentry for production error tracking
  ```

#### 6.3 Performance Optimization
**Technical Components**:
```typescript
// Image optimization with Next.js
// Static generation for property pages
// Edge caching for API responses
// Database connection pooling
```

**Implementation Tasks**:
- [ ] **Performance Optimization**
  ```typescript
  // src/app/properties/[id]/page.tsx
  export async function generateStaticParams() {
    // Generate static pages for active auctions
    const activeProperties = await prisma.property.findMany({
      where: {
        auctionObject: {
          auction: {
            status: 'published',
            auctionDate: {
              gte: new Date()
            }
          }
        }
      },
      select: { id: true }
    });
    
    return activeProperties.map((property) => ({
      id: property.id
    }));
  }
  ```

**Success Criteria**: 
- Core Web Vitals score >90
- Map load time <1 second
- Filter response time <300ms
- Property detail load <500ms
- 99.5% uptime

---

## Technical Stack Summary

### Core Technologies
```json
{
  "framework": "Next.js 14+ with App Router",
  "language": "TypeScript",
  "database": "PostgreSQL 15+ with PostGIS",
  "orm": "Prisma with PostGIS extension",
  "caching": "Redis (Vercel KV)",
  "styling": "Tailwind CSS",
  "maps": "React Leaflet with OpenStreetMap",
  "forms": "React Hook Form with Zod validation",
  "state": "Zustand for global state",
  "deployment": "Vercel with edge functions",
  "monitoring": "Vercel Analytics + Sentry",
  "llm": "OpenAI/Anthropic API"
}
```

### Development Tools
```json
{
  "containerization": "Docker Compose for local development",
  "testing": "Jest + React Testing Library + Playwright",
  "linting": "ESLint + Prettier + Husky",
  "ci_cd": "GitHub Actions + Vercel",
  "database_tools": "Prisma Studio + pgAdmin",
  "api_testing": "Bruno/Insomnia for API testing"
}
```

### Scalability Features
- PostGIS spatial indexing for efficient map queries
- Redis caching for frequently accessed data
- Vercel edge functions for global performance
- Database connection pooling
- Image optimization with Next.js
- Static generation for property pages
- Progressive enhancement approach

This implementation plan provides complete technical setup instructions for each phase and can be executed using SuperClaude's implementation commands with clear, actionable tasks and success criteria.