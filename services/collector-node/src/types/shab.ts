/**
 * Type definitions for SHAB data structures
 * Shared between API service and processor
 */

// Types for SHAB API responses
export interface ShabPublicationData {
  id: string;
  publishDate: string;
  xmlContent: string;
  canton: string;
  rubric: string;
  subRubric: string;
  officialLanguage: string;
  metaId?: string;
}

export interface ShabApiResponse {
  content: Array<{
    meta: {
      id: string;
      publicationDate: string;
      cantons: string[];
      rubric: string;
      subRubric: string;
      language: string;
      publicationNumber: string;
      publicationState: string;
      registrationOffice: {
        displayName: string;
      };
      title: {
        de?: string;
        fr?: string;
        it?: string;
        en?: string;
      };
    };
    content?: {
      auctionObjects?: string;
      auction?: {
        date: string;
        time: string;
        location: string;
      };
      remarks?: string;
    };
  }>;
  total: number;
  pageRequest: {
    page: number;
    size: number;
  };
}

export interface ShabContentResponse {
  content: string; // XML content
  publicationDate: string;
  canton: {
    shortName: string;
  };
  rubric: {
    name: string;
  };
  subRubric?: {
    name: string;
  };
  officialLanguage: {
    shortName: string;
  };
}

export interface ProcessingResult {
  processed: number;
  created: number;
  skipped: number;
  errors: number;
  details: Array<{
    publicationId: string;
    status: 'created' | 'skipped' | 'error';
    message?: string;
  }>;
}

export class ShabApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ShabApiError';
  }
}

export class ShabProcessingError extends Error {
  constructor(message: string, public publicationId?: string) {
    super(message);
    this.name = 'ShabProcessingError';
  }
}