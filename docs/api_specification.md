# AuctionDeal API Specification

## Base URL
```
https://api.auctiondeal.ch/api/v1
```

## Authentication
MVP Phase: No authentication required
Future Phases: JWT Bearer tokens for user-specific features

## Content Types
- Request: `application/json`
- Response: `application/json`

---

## Property Search Endpoints

### GET /properties/search

Search properties within geographic viewport with optional filters.

**Query Parameters:**
- `ne_lat` (number, required): Northeast latitude bound
- `ne_lng` (number, required): Northeast longitude bound  
- `sw_lat` (number, required): Southwest latitude bound
- `sw_lng` (number, required): Southwest longitude bound
- `types` (string, optional): Comma-separated property types (Land,EFH,MFH,Wohnung,Commercial,Parking,Misc)
- `min_price` (number, optional): Minimum estimated value in CHF
- `max_price` (number, optional): Maximum estimated value in CHF
- `cantons` (string, optional): Comma-separated canton codes (ZH,BE,VD,etc)
- `languages` (string, optional): Source languages (de,fr,it)  
- `ui_lang` (string, optional, default=de): Frontend language for labels (de,fr,it,en)
- `limit` (number, optional, default=100): Maximum results to return

**Example Request:**
```
GET /api/v1/properties/search?ne_lat=47.4&ne_lng=8.6&sw_lat=47.2&sw_lng=8.4&types=EFH,MFH&min_price=400000&max_price=1000000&cantons=ZH
```

**Response:**
```json
{
  "properties": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "address": "Bahnhofstrasse 1, 8001 Zürich",
      "coordinates": [47.3769, 8.5417],
      "propertyType": "EFH",
      "estimatedValue": {
        "amount": 950000,
        "currency": "CHF",
        "confidence": 0.87
      },
      "auctionDate": "2024-03-15T10:00:00Z",
      "auctionLocation": "Bezirksgericht Zürich",
      "confidence": 0.92,
      "sourceLanguage": "de"
    }
  ],
  "totalCount": 45,
  "viewport": {
    "northEast": { "lat": 47.4, "lng": 8.6 },
    "southWest": { "lat": 47.2, "lng": 8.4 }
  },
  "appliedFilters": {
    "propertyTypes": ["EFH", "MFH"],
    "priceRange": { "min": 400000, "max": 1000000 },
    "cantons": ["ZH"]
  },
  "hasMore": true
}
```

### POST /properties/search

Advanced search with complex filter criteria.

**Request Body:**
```json
{
  "viewport": {
    "northEast": { "lat": 47.4, "lng": 8.6 },
    "southWest": { "lat": 47.2, "lng": 8.4 }
  },
  "filters": {
    "propertyTypes": ["EFH", "MFH"],
    "priceRange": { "min": 400000, "max": 1000000 },
    "cantons": ["ZH", "ZG"],
    "languages": ["de"]
  },
  "sort": {
    "field": "auctionDate",
    "direction": "asc"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  }
}
```

**Response:** Same as GET /properties/search

---

## Property Detail Endpoints

### GET /properties/{id}

Get detailed information for a specific property.

**Path Parameters:**
- `id` (string, required): Property UUID

**Example Request:**
```
GET /api/v1/properties/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "address": "Bahnhofstrasse 1, 8001 Zürich",
  "coordinates": [47.3769, 8.5417],
  "propertyType": "EFH",
  "estimatedValue": {
    "amount": 950000,
    "currency": "CHF",
    "confidence": 0.87
  },
  "auctionDate": "2024-03-15T10:00:00Z",
  "auctionLocation": "Bezirksgericht Zürich",
  "confidence": 0.92,
  "sourceLanguage": "de",
  "fullDescription": "Einfamilienhaus mit 5.5 Zimmern...",
  "auctionDetails": {
    "auctionId": "660e8400-e29b-41d4-a716-446655440000",
    "status": "published",
    "minimumBid": {
      "amount": 500000,
      "currency": "CHF"
    },
    "contactInfo": "Betreibungsamt Zürich, Tel: 044 123 45 67"
  },
  "location": {
    "canton": "ZH",
    "municipality": "Zürich",
    "coordinates": [47.3769, 8.5417]
  },
  "processingMetadata": {
    "classificationConfidence": 0.92,
    "valueConfidence": 0.87,
    "processedAt": "2024-02-28T14:30:00Z"
  }
}
```

---

## Auction Information Endpoints

### GET /auctions/{id}

Get auction details and all associated properties.

**Path Parameters:**
- `id` (string, required): Auction UUID

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "shabPublicationId": "SB01-0000004345",
  "auctionDate": "2024-03-15T10:00:00Z",
  "auctionLocation": "Bezirksgericht Zürich",
  "status": "published",
  "properties": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "address": "Bahnhofstrasse 1, 8001 Zürich",
      "propertyType": "EFH",
      "estimatedValue": {
        "amount": 950000,
        "currency": "CHF"
      }
    }
  ],
  "legalRequirements": [
    "Besichtigung: 14.02.2024, 14:00-16:00",
    "Mindestgebot: CHF 500'000",
    "Sicherheitsleistung: 10% des Schätzwertes"
  ],
  "contactInfo": "Betreibungsamt Zürich, Tel: 044 123 45 67"
}
```

---

## Filter Options Endpoints

### GET /filters/options

Get available filter values and counts with localized labels.

**Query Parameters:**
- `ui_lang` (string, optional, default=de): Frontend language for labels (de,fr,it,en)

**Response:**
```json
{
  "propertyTypes": [
    { "value": "Land", "label": "Bauland", "count": 45 },
    { "value": "EFH", "label": "Einfamilienhaus", "count": 234 },
    { "value": "MFH", "label": "Mehrfamilienhaus", "count": 156 },
    { "value": "Wohnung", "label": "Wohnung", "count": 445 },
    { "value": "Commercial", "label": "Gewerbe", "count": 78 },
    { "value": "Parking", "label": "Parkplatz", "count": 23 },
    { "value": "Misc", "label": "Diverses", "count": 12 }
  ],
  "cantons": [
    { "code": "ZH", "name": "Zürich", "count": 234 },
    { "code": "BE", "name": "Bern", "count": 189 },
    { "code": "VD", "name": "Vaud", "count": 145 },
    { "code": "AG", "name": "Aargau", "count": 112 }
  ],
  "priceRanges": [
    { "min": 0, "max": 500000, "label": "Bis CHF 500k", "count": 234 },
    { "min": 500000, "max": 1000000, "label": "CHF 500k - 1mio", "count": 345 },
    { "min": 1000000, "max": 2000000, "label": "CHF 1mio - 2mio", "count": 123 },
    { "min": 2000000, "max": null, "label": "Über CHF 2mio", "count": 45 }
  ],
  "languages": [
    { "code": "de", "name": "Deutsch", "count": 723 },
    { "code": "fr", "name": "Français", "count": 234 },
    { "code": "it", "name": "Italiano", "count": 89 }
  ],
  "language": "de"
}
```

**English Example** (`?ui_lang=en`):
```json
{
  "propertyTypes": [
    { "value": "Land", "label": "Land", "count": 45 },
    { "value": "EFH", "label": "Single Family House", "count": 234 },
    { "value": "MFH", "label": "Multi Family House", "count": 156 },
    { "value": "Wohnung", "label": "Apartment", "count": 445 },
    { "value": "Commercial", "label": "Commercial", "count": 78 },
    { "value": "Parking", "label": "Parking", "count": 23 },
    { "value": "Misc", "label": "Miscellaneous", "count": 12 }
  ],
  "language": "en"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "INVALID_VIEWPORT",
    "message": "Viewport bounds are invalid or too large",
    "details": {
      "field": "viewport",
      "reason": "Maximum viewport area exceeded"
    }
  }
}
```

### Error Codes

- `INVALID_VIEWPORT`: Viewport parameters are invalid or area too large
- `INVALID_FILTERS`: Filter parameters are malformed
- `PROPERTY_NOT_FOUND`: Requested property does not exist
- `AUCTION_NOT_FOUND`: Requested auction does not exist
- `RATE_LIMIT_EXCEEDED`: Too many requests from client
- `INTERNAL_ERROR`: Server error occurred

### HTTP Status Codes

- `200 OK`: Successful response
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **Anonymous users**: 100 requests per minute
- **Future authenticated users**: 1000 requests per minute

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: UTC timestamp when window resets

---

## Geographic Constraints

- **Viewport Size**: Maximum 200km x 200km area
- **Switzerland Bounds**: Requests outside Swiss boundaries return empty results
- **Coordinate System**: WGS84 decimal degrees (EPSG:4326)

---

## Performance Characteristics

- **Search Response Time**: < 300ms (95th percentile)
- **Property Detail**: < 500ms (95th percentile)
- **Cache Duration**: 5 minutes for search results, 1 hour for property details
- **Result Limits**: Maximum 1000 properties per search request