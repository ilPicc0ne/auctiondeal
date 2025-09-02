# SHAB API Interface Documentation

## Overview
The Swiss Commercial Gazette (SHAB) provides an API for accessing publication data, including property auction announcements. This API is the primary data source for Auctiondeal's auction aggregation system.

## Base URL
```
https://www.shab.ch/api/v1/publications
```

## 🧾 Get Publications Endpoint

### Endpoint
```
GET /api/v1/publications
```

### Description
Fetches a paginated list of SHAB publications (e.g. property auctions), filtered by publication date, rubric, and other metadata. This endpoint returns publication metadata in JSON format. The full content can be fetched separately via the metaId.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `allowRubricSelection` | boolean | No | Allows rubric selection client-side. Usually set to true. |
| `includeContent` | boolean | No | If true, includes full content. Set to false for metadata only. |
| `pageRequest.page` | integer | Yes | Page number to retrieve (starting at 0). |
| `pageRequest.size` | integer | Yes | Number of items per page (e.g., 100). |
| `publicationDate.start` | date | No | Start date in YYYY-MM-DD format (e.g., 2025-08-26). |
| `publicationDate.end` | date | No | End date in YYYY-MM-DD format (e.g., 2025-09-01). |
| `publicationStates` | string | No | Filter by publication status (e.g., PUBLISHED). |
| `searchPeriod` | string | No | Time window preset (e.g., LAST7DAYS, TODAY, LAST30DAYS). |
| `subRubrics` | string | No | Filter by subrubric (e.g., SB01 for property auctions). |

### Example Request
```http
GET /api/v1/publications?allowRubricSelection=true&includeContent=false&pageRequest.page=0&pageRequest.size=100&publicationDate.end=2025-09-01&publicationDate.start=2025-08-26&publicationStates=PUBLISHED&searchPeriod=LAST7DAYS&subRubrics=SB01 HTTP/1.1
Host: www.shab.ch
Accept: application/json
```

### Response Format
Returns a paginated JSON array of publication objects. Example:

```json
{
  "metaId": "8fcb78c0-ba7f-473c-95fa-6be54a3f28b4",
  "publicationNumber": "SB01-0000004345",
  "publicationDate": "2025-09-01",
  "publicationState": "PUBLISHED",
  "language": "de",
  "title": "Betreibungsamtliche Grundstücksteigerung Asha Kumari Jain Cornet"
}
```

## 📄 Fetch Full XML Content

### Endpoint
```
GET /api/v1/publications/{metaId}/xml
```

### Description
Fetches the complete structured XML data for a specific publication using its metaId. This XML contains detailed auction, property, and legal remedy information.

### Example Request
```http
GET https://www.shab.ch/api/v1/publications/8fcb78c0-ba7f-473c-95fa-6be54a3f28b4/xml
```

### Response
Returns a full XML document with comprehensive auction details including:
- Property information (address, type, size)
- Auction details (date, time, location)
- Financial information (estimated value, minimum bid)
- Legal information (auction conditions, documentation)

## Sample XML Structure Analysis

### Reference Files
- `context/SB01-0000004345.xml` - Basic auction structure with estimated value in auctionObjects
- `context/SB01-0000004347.xml` - With Besichtigung data in remarks field

### Critical XML Field Mapping

**Essential Fields for Extraction:**
- **`auctionObjects`** - **MOST CRITICAL** HTML-formatted content containing:
  - Property description and address (embedded in German text)
  - **Estimated value**: Free-text field requiring advanced parsing - example formats:
    - "Rechtskräftige Betreibungsamtliche Schätzung: CHF 777'000.00"
    - "Amtliche Schätzung CHF 1'200'000.-"
    - May vary in phrasing, currency formatting, and placement within text
  - Property details (rooms, size, features) in unstructured German descriptions
  - **Note**: May contain multiple properties - MVP extracts first only
- **`auction/date`** - Scheduled auction date (YYYY-MM-DD)
- **`auction/time`** - Auction start time (HH:MM)
- **`auction/location`** - Physical venue with full address
- **`publicationNumber`** - Unique auction identifier (e.g., "SB01-0000004345")
- **`publicationState`** - Status: PUBLISHED, CANCELLED, etc.
- **`cantons`** - Canton code for geographic filtering (e.g., "AG")
- **`registrationOffice/displayName`** - Responsible enforcement office
- **`remarks`** - Unstructured German text containing viewing appointments when available
  - Format: "Besichtigung: [Day], [Date] von [Time] bis [Time]"
  - May contain multiple viewing appointments
  - Field may not exist in all auctions

### Database Architecture Decisions
- **Raw XML Storage**: Complete XML document stored in database
- **Linked Objects**: Multiple XML files can reference same auction (updates, cancellations)
- **HTML Parsing Required**: `auctionObjects` contains HTML that must be parsed for structured data
- **Multi-Object Support**: Future enhancement to extract multiple properties from single `auctionObjects`

## LLM Processing Requirements

**Fuzzy/Unstructured Fields Requiring AI-Powered Parsing:**
- **`auctionObjects`** - HTML-formatted property descriptions requiring:
  - German language processing for property type classification
  - Address extraction from embedded unstructured text
  - **Estimated value parsing**: Advanced text analysis for varied formats and phrasings:
    - Multiple possible German terms: "Rechtskräftige Betreibungsamtliche Schätzung", "Amtliche Schätzung", "Schätzwert"
    - Variable currency formatting: "CHF 777'000.00", "CHF 1'200'000.-", "Fr. 500'000"
    - Flexible text placement within property descriptions
- **`remarks`** - Unstructured German text requiring:
  - Flexible parsing for Besichtigung appointments with linguistic variations
  - Date/time format standardization from German text
  - Conditional processing (field may not exist)

**Technical Implementation:**
- LLM integration required for reliable data extraction from fuzzy fields
- Fallback to structured XML fields when unstructured parsing fails
- German language model capabilities essential for accurate classification

## Implementation Notes for Auctiondeal

### Daily Scraping Strategy
1. **Fetch New Publications**: Use `searchPeriod=TODAY` or date range filters to get daily updates
2. **Filter for Property Auctions**: Use `subRubrics=SB01` to focus on property foreclosure auctions
3. **Pagination**: Handle paginated responses with appropriate page size (recommend 100)
4. **XML Content**: Fetch detailed XML for each relevant metaId to extract structured property data

### Key Subrubrics for Property Auctions
- `SB01`: Property foreclosure auctions (Grundstücksteigerungen)
- Additional subrubrics may be relevant for different auction types

### Error Handling
- Implement retry logic for API failures
- Handle rate limiting if applicable
- Validate XML structure before processing
- Log API response errors for monitoring

### Data Processing Pipeline
1. **Fetch Metadata**: Get publication list with basic info
2. **Filter Relevant**: Identify property auction publications
3. **Fetch XML**: Retrieve detailed content for processing
4. **Parse & Store**: Extract structured data and store in database
5. **Duplicate Detection**: Check against existing records to avoid duplicates
6. **Update Tracking**: Monitor for cancellations or changes to existing auctions