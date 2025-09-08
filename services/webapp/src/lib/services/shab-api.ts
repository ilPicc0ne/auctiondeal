/**
 * SHAB API Client Service
 * Handles communication with Swiss Commercial Gazette API
 * Includes XML parsing, error handling, and retry logic
 */

import { XMLParser } from 'fast-xml-parser';

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

interface ShabApiResponse {
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

interface ShabContentResponse {
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

export class ShabApiService {
  private readonly baseUrl = 'https://www.shab.ch/api/v1/publications';
  private readonly xmlParser: XMLParser;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: false,
      trimValues: true
    });
  }

  /**
   * Fetch publications for a specific date range
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)  
   * @param page Page number (default: 0)
   * @param size Items per page (default: 100)
   */
  async fetchPublications(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 100
  ): Promise<ShabPublicationData[]> {
    const params = new URLSearchParams({
      'allowRubricSelection': 'true',
      'includeContent': 'true', // Include content for complete data
      'pageRequest.page': page.toString(),
      'pageRequest.size': size.toString(),
      'publicationDate.start': startDate,
      'publicationDate.end': endDate,
      'publicationStates': 'PUBLISHED,CANCELLED',
      'subRubrics': 'SB01' // Property foreclosure auctions
    });

    const response = await this.makeRequest<ShabApiResponse>(
      `${this.baseUrl}?${params.toString()}`
    );

    // Fetch XML content for each publication
    const publications: ShabPublicationData[] = await Promise.all(
      response.content.map(async (item) => {
        const xmlContent = await this.fetchPublicationXml(item.meta.id);
        
        return {
          id: item.meta.id,
          publishDate: item.meta.publicationDate,
          xmlContent: xmlContent,
          canton: item.meta.cantons[0] || 'Unknown',
          rubric: item.meta.rubric,
          subRubric: item.meta.subRubric,
          officialLanguage: item.meta.language,
          metaId: item.meta.id
        };
      })
    );

    return publications;
  }

  /**
   * Fetch full XML content for a specific publication
   * @param metaId Publication meta ID
   */
  async fetchPublicationXml(metaId: string): Promise<string> {
    const url = `${this.baseUrl}/${metaId}/xml`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://shab.ch/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new ShabApiError(
        `SHAB XML request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return await response.text();
  }

  /**
   * Fetch full structured content for a specific publication (legacy method)
   * @param metaId Publication meta ID
   */
  async fetchPublicationContent(metaId: string): Promise<string> {
    const url = `${this.baseUrl}/${metaId}`;
    
    const response = await this.makeRequest<ShabContentResponse>(url);
    
    return response.content || '';
  }

  /**
   * Fetch daily publications (today's publications)
   */
  async fetchDailyPublications(): Promise<ShabPublicationData[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.fetchPublications(today, today);
  }

  /**
   * Fetch historical publications for a date range
   * @param daysBack Number of days to go back from today
   */
  async fetchHistoricalPublications(daysBack: number = 90): Promise<ShabPublicationData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Process in weekly batches to avoid overwhelming the API
    const allPublications: ShabPublicationData[] = [];
    const batchSizeDays = 7;
    
    for (let i = 0; i < daysBack; i += batchSizeDays) {
      const batchStart = new Date(startDate);
      batchStart.setDate(startDate.getDate() + i);
      
      const batchEnd = new Date(batchStart);
      batchEnd.setDate(batchStart.getDate() + Math.min(batchSizeDays - 1, daysBack - i - 1));

      const batchStartStr = batchStart.toISOString().split('T')[0];
      const batchEndStr = batchEnd.toISOString().split('T')[0];

      console.log(`📅 Fetching batch: ${batchStartStr} to ${batchEndStr}`);

      const batchPublications = await this.fetchPublications(
        batchStartStr,
        batchEndStr
      );

      allPublications.push(...batchPublications);

      // Rate limiting: wait between batches
      if (i + batchSizeDays < daysBack) {
        await this.delay(500);
      }
    }

    return allPublications;
  }

  /**
   * Parse XML content to extract auction information
   * @param xmlContent Raw XML string from SHAB
   */
  parsePublicationXml(xmlContent: string): {
    auctions: Array<{
      date?: string;
      location?: string;
      objects: Array<{
        text: string;
        order: number;
      }>;
    }>;
    language: string;
  } {
    try {
      const parsed = this.xmlParser.parse(xmlContent);
      const language = this.detectLanguage(xmlContent);

      // Extract auction information from the SB01 XML structure
      const auctions = [];
      
      // The XML has namespace SB01:publication
      const publication = parsed['SB01:publication'];
      
      if (publication?.content) {
        const content = publication.content;
        const auction = content.auction;
        
        if (auction) {
          auctions.push({
            date: auction.date ? this.formatAuctionDate(auction.date, auction.time) : undefined,
            location: auction.location,
            objects: [{
              text: content.auctionObjects || '', // Store raw HTML for LLM processing
              order: 1
            }]
          });
        }
      }

      return {
        auctions,
        language
      };
    } catch (error) {
      console.error('XML parsing error:', error);
      throw new ShabApiError(`Failed to parse XML content: ${(error as Error).message}`);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(url: string, attempt: number = 1): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://shab.ch/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new ShabApiError(
          `SHAB API request failed: ${response.status} ${response.statusText}`,
          response.status,
          await response.text()
        );
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`SHAB API request failed (attempt ${attempt}), retrying...`, error.message);
        await this.delay(this.retryDelayMs * attempt);
        return this.makeRequest<T>(url, attempt + 1);
      }

      throw error instanceof ShabApiError ? error : new ShabApiError(
        `SHAB API request failed after ${this.maxRetries} attempts: ${error.message}`
      );
    }
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Detect language from XML content
   */
  private detectLanguage(content: string): string {
    // Simple language detection based on common patterns
    if (content.includes('Versteigerung') || content.includes('Schätzwert')) {
      return 'de';
    } else if (content.includes('vente') || content.includes('enchère')) {
      return 'fr';
    } else if (content.includes('vendita') || content.includes('asta')) {
      return 'it';
    }
    return 'de'; // Default to German
  }

  /**
   * Extract auction date from content
   */
  private extractDate(content: any): string | undefined {
    // Convert to string if it's an object
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    
    // Basic date extraction - will be enhanced with proper regex patterns
    const datePattern = /\d{1,2}\.\s*\w+\s*\d{4}/g;
    const match = contentStr.match(datePattern);
    return match ? match[0] : undefined;
  }

  /**
   * Extract auction location from content
   */
  private extractLocation(content: any): string | undefined {
    // Convert to string if it's an object
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    
    // Basic location extraction - will be enhanced with proper patterns
    const locationPattern = /(Bezirksgericht|Amtsgericht|Tribunal)\s+[\w\s]+/g;
    const match = contentStr.match(locationPattern);
    return match ? match[0] : undefined;
  }

  /**
   * Format auction date and time
   */
  private formatAuctionDate(date: string, time?: string): string {
    if (time) {
      return `${date} ${time}`;
    }
    return date;
  }

  /**
   * Extract auction objects from content
   */
  private extractAuctionObjects(content: any): Array<{ text: string; order: number }> {
    // Convert to string if it's an object
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    
    // Basic object extraction - will be enhanced with proper parsing
    const objects: Array<{ text: string; order: number }> = [];
    const lines = contentStr.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      if (line.length > 50 && !line.includes('Versteigerung am')) {
        objects.push({
          text: line.trim(),
          order: index + 1
        });
      }
    });

    return objects;
  }
}

// Singleton instance
export const shabApiService = new ShabApiService();