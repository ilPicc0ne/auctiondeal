// Core types for AuctionDeal application

export interface Property {
  id: string;
  auctionObjectId: string;
  propertyType: 'Land' | 'EFH' | 'MFH' | 'Wohnung' | 'Commercial' | 'Parking' | 'Misc';
  classificationConfidence?: number;
  estimatedValueChf?: number;
  valueConfidence?: number;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  canton?: string;
  municipality?: string;
  sourceLanguage: string;
  createdAt: string;
  updatedAt: string;
  auctionObject: AuctionObject;
}

export interface AuctionObject {
  id: string;
  auctionId: string;
  rawText: string;
  objectOrder: number;
  createdAt: string;
  auction: Auction;
}

export interface Auction {
  id: string;
  shabPublicationId: string;
  auctionDate: string;
  auctionLocation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  shabPublication: ShabPublication;
}

export interface ShabPublication {
  id: string;
  publishDate: string;
  xmlContent: string;
  canton: string;
  rubric: string;
  subRubric: string;
  officialLanguage: string;
  processingStatus: string;
  createdAt: string;
  processedAt?: string;
}

export interface ViewportBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

export interface FilterState {
  propertyTypes: Array<Property['propertyType']>;
  priceRange?: {
    min?: number;
    max?: number;
  };
  cantons: string[];
  includeWithoutValues: boolean;
}