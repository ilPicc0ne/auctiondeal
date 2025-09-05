# Domain Model TypeScript Interfaces

## Core Value Objects

```typescript
// Geographic and location types
interface GeoCoordinates {
  lat: number;
  lng: number;
}

interface ViewportBounds {
  northEast: GeoCoordinates;
  southWest: GeoCoordinates;
}

interface PropertyLocation {
  address: string;
  coordinates: GeoCoordinates;
  canton: string;
  municipality: string;
}

// Swiss language support + English for frontend
enum SwissLanguage {
  GERMAN = 'de',
  FRENCH = 'fr',
  ITALIAN = 'it'
}

enum FrontendLanguage {
  GERMAN = 'de',
  FRENCH = 'fr', 
  ITALIAN = 'it',
  ENGLISH = 'en'
}

// Property classification
enum PropertyType {
  LAND = 'Land',
  EFH = 'EFH',
  MFH = 'MFH',
  WOHNUNG = 'Wohnung',
  COMMERCIAL = 'Commercial',
  PARKING = 'Parking',
  MISC = 'Misc'
}

interface PropertyClassification {
  type: PropertyType;
  confidence: number;
  sourceLanguage: SwissLanguage;
  extractedAt: Date;
}

interface MoneyAmount {
  amount: number;
  currency: 'CHF';
  confidence?: number;
}

interface PropertyValuation {
  estimatedValue: MoneyAmount;
  confidence: number;
  extractedAt: Date;
}
```

## Auction Data Management Context

```typescript
// Aggregate Root - Auction
interface Auction {
  id: string;
  shabPublicationId: string;
  auctionDate: Date;
  auctionLocation: string;
  status: 'published' | 'cancelled';
  objects: AuctionObject[];
  createdAt: Date;
  updatedAt: Date;
}

// Entity within Auction aggregate
interface AuctionObject {
  id: string;
  auctionId: string;
  rawText: string;
  objectOrder: number;
  createdAt: Date;
}

// Aggregate Root - SHAB Publication
interface ShabPublication {
  id: string;
  publishDate: Date;
  xmlContent: string;
  canton: string;
  
  // SHAB metadata from XML
  rubric: string;                    // e.g., "SB"
  subRubric: string;                 // e.g., "SB01"
  officialLanguage: SwissLanguage;   // from XML <language>
  
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}
```

## Property Intelligence Context

```typescript
// Aggregate Root - Property
interface Property {
  id: string;
  auctionObjectId: string;
  classification: PropertyClassification;
  location: PropertyLocation;
  valuation?: PropertyValuation;
  processedAt: Date;
}

// Domain Services
interface PropertyClassificationService {
  classifyProperty(text: string, language: SwissLanguage): Promise<PropertyClassification>;
}

interface ValueExtractionService {
  extractValue(text: string, language: SwissLanguage): Promise<PropertyValuation>;
}

// Language detection service no longer needed - use officialLanguage from SHAB XML
```

## User Discovery Context

```typescript
// Search and filtering value objects
interface FilterCriteria {
  propertyTypes: PropertyType[];
  priceRange?: {
    min: number;
    max: number;
  };
  cantons: string[];
  languages?: SwissLanguage[];
}

interface SearchSession {
  id: string;
  viewport: ViewportBounds;
  filters: FilterCriteria;
  createdAt: Date;
  lastActivityAt: Date;
}

// Display representations
interface PropertyCard {
  id: string;
  address: string;
  coordinates: GeoCoordinates;
  propertyType: PropertyType;
  estimatedValue?: MoneyAmount;
  auctionDate: Date;
  auctionLocation: string;
  confidence: number;
  sourceLanguage: SwissLanguage;
}

interface PropertyDetail extends PropertyCard {
  fullDescription: string;
  auctionDetails: {
    auctionId: string;
    status: 'published' | 'cancelled';
    contactInfo?: string;
  };
  processingMetadata: {
    classificationConfidence: number;
    valueConfidence?: number;
    processedAt: Date;
  };
}
```

## Application Layer Interfaces

```typescript
// Use case interfaces
interface AuctionDataService {
  synchronizeDailyData(): Promise<void>;
  processPublication(publicationId: string): Promise<void>;
  updateAuctionStatus(auctionId: string, status: 'published' | 'cancelled'): Promise<void>;
}

interface PropertySearchService {
  searchByViewport(viewport: ViewportBounds, filters?: FilterCriteria): Promise<PropertyCard[]>;
  getPropertyDetail(propertyId: string): Promise<PropertyDetail>;
  getFilterOptions(): Promise<{
    propertyTypes: PropertyType[];
    cantons: string[];
    priceRanges: { min: number; max: number }[];
  }>;
}

// Repository interfaces
interface ShabPublicationRepository {
  save(publication: ShabPublication): Promise<void>;
  findById(id: string): Promise<ShabPublication | null>;
  findUnprocessed(): Promise<ShabPublication[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ShabPublication[]>;
}

interface AuctionRepository {
  save(auction: Auction): Promise<void>;
  findById(id: string): Promise<Auction | null>;
  findByStatus(status: 'published' | 'cancelled'): Promise<Auction[]>;
  findUpcoming(fromDate: Date): Promise<Auction[]>;
}

interface PropertyRepository {
  save(property: Property): Promise<void>;
  findById(id: string): Promise<Property | null>;
  findInViewport(viewport: ViewportBounds): Promise<Property[]>;
  findByFilters(filters: FilterCriteria, viewport?: ViewportBounds): Promise<Property[]>;
  findByPropertyType(type: PropertyType): Promise<Property[]>;
}
```

## Infrastructure Layer Interfaces

```typescript
// External service adapters
interface ShabApiClient {
  fetchDailyPublications(date: Date): Promise<ShabPublication[]>;
  fetchPublicationsSince(startDate: Date): Promise<ShabPublication[]>;
  fetchPublicationById(id: string): Promise<ShabPublication>;
}

interface LlmProcessingClient {
  detectLanguage(text: string): Promise<{
    language: SwissLanguage;
    confidence: number;
  }>;
  classifyProperty(text: string, language: SwissLanguage): Promise<{
    propertyType: PropertyType;
    confidence: number;
    extractedFeatures: string[];
  }>;
  extractValue(text: string, language: SwissLanguage): Promise<{
    estimatedValue: number;
    confidence: number;
    currency: 'CHF';
  }>;
}

// Database connection interfaces
interface DatabaseConnection {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}

interface SpatialQuery {
  findWithinBounds(bounds: ViewportBounds): Promise<Property[]>;
  findNearPoint(coordinates: GeoCoordinates, radiusKm: number): Promise<Property[]>;
}
```

## API Response Types

```typescript
// REST API response interfaces
interface PropertySearchResponse {
  properties: PropertyCard[];
  totalCount: number;
  viewport: ViewportBounds;
  appliedFilters: FilterCriteria;
  hasMore: boolean;
}

interface FilterOptionsResponse {
  propertyTypes: {
    value: PropertyType;
    label: string;
    count: number;
  }[];
  cantons: {
    code: string;
    name: string;
    count: number;
  }[];
  priceRanges: {
    min: number;
    max: number;
    label: string;
  }[];
  // Language preference for labels
  language: FrontendLanguage;
}

// Multi-language property type labels
interface PropertyTypeLabels {
  [PropertyType.LAND]: {
    de: 'Bauland';
    fr: 'Terrain';  
    it: 'Terreno';
    en: 'Land';
  };
  [PropertyType.EFH]: {
    de: 'Einfamilienhaus';
    fr: 'Maison individuelle';
    it: 'Casa unifamiliare'; 
    en: 'Single Family House';
  };
  [PropertyType.MFH]: {
    de: 'Mehrfamilienhaus';
    fr: 'Immeuble';
    it: 'Casa plurifamiliare';
    en: 'Multi Family House';
  };
  [PropertyType.WOHNUNG]: {
    de: 'Wohnung';
    fr: 'Appartement';
    it: 'Appartamento';
    en: 'Apartment';
  };
  [PropertyType.COMMERCIAL]: {
    de: 'Gewerbe';
    fr: 'Commercial';
    it: 'Commerciale';
    en: 'Commercial';
  };
  [PropertyType.PARKING]: {
    de: 'Parkplatz';
    fr: 'Place de parc';
    it: 'Posto auto';
    en: 'Parking';
  };
  [PropertyType.MISC]: {
    de: 'Diverses';
    fr: 'Divers';
    it: 'Vario';
    en: 'Miscellaneous';
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```

These interfaces provide the foundational types for implementing the AuctionDeal system with strong typing throughout the application layers.