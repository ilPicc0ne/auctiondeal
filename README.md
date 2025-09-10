# AuctionDeal

Swiss property auction intelligence platform that aggregates and analyzes real estate auctions from the Swiss Commercial Gazette (SHAB).

## Architecture

**Service-Oriented Architecture** with specialized backend services and shared libraries:

```
auctiondeal/
├── services/
│   ├── webapp/           # Next.js 15 web application
│   ├── collector-node/   # Node.js SHAB data collection service  
│   └── etl-py/          # Python ETL & LLM processing service
├── libs/
│   ├── shared-ts/       # TypeScript utilities + Prisma client
│   └── contracts/       # API contracts and types
├── db/                  # Database schema and migrations
└── ops/                 # Infrastructure and deployment
```

### Backend Architecture Decision

The backend uses **two specialized services** for optimal performance and maintainability:

- **🟢 collector-node (Node.js)**: Handles SHAB API scraping with high efficiency and expandability for web data collection
- **🐍 etl-py (Python)**: Powers LLM pipelines and ML experimentation with Python's superior ecosystem for AI/ML workflows

This separation allows each service to leverage the best technology for its specific domain while maintaining clean service boundaries.

## Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+ (for ETL service)
- PostgreSQL with PostGIS extension
- TypeScript and Git

### Database Setup
```bash
# Set up environment variables
cp services/collector-node/.env.example services/collector-node/.env
# Edit DATABASE_URL in .env file

# Install dependencies and generate Prisma client
cd libs/shared-ts && npm install && npm run build
cd services/collector-node && npm install
cd services/webapp && npm install

# Push database schema
cd libs/shared-ts && npm run prisma:db:push
```

### Development

**Web Application:**
```bash
cd services/webapp
npm run dev  # http://localhost:3000
```

**Data Collection Service:**
```bash
cd services/collector-node
npm run dev  # Background data collection
```

**ETL & LLM Processing Service:**
```bash
cd services/etl-py
pip install -r requirements.txt
python main.py  # LLM processing pipeline
```

## Database Management

### Key Commands
```bash
cd services/collector-node

# Check database status and statistics
npm run db:status

# Backfill historical data (default: 90 days)
npm run db:backfill
npm run db:backfill 30  # Specific number of days

# Clear database (with safety confirmations)
npm run db:clear
npm run db:clear:force  # Skip confirmations
```

### Current Database Status
- **147 SHAB Publications** (June 12 - September 5, 2025)
- **147 Auctions** with complete XML content retention
- **147 Auction Objects** with raw text for LLM processing  
- **441 Total Records** across all tables
- **Multi-language Support**: German (70), French (51), Italian (26)
- **Geographic Coverage**: All major Swiss cantons (TI, BE, VS, ZH, VD, etc.)

## Tech Stack

### Frontend (webapp)
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Leaflet** maps with clustering
- **React Hook Form** with Zod validation

### Backend Services

#### Collector Service (collector-node)
- **Node.js** with TypeScript
- **Prisma ORM** with PostgreSQL
- **fast-xml-parser** for SHAB XML processing
- **Winston** logging and **node-cron** scheduling
- **Optimized for**: High-efficiency web scraping and API data collection

#### ETL Service (etl-py) 
- **Python 3.9+** with modern ML libraries
- **LLM Integration** for property description parsing
- **Data Processing** pipelines for classification and enrichment
- **Optimized for**: AI/ML experimentation and LLM workflows

### Database
- **PostgreSQL** with **PostGIS** extension
- **Prisma** for schema management and migrations
- **JSONB** fields for flexible data storage

### Data Source
- **SHAB API**: `https://www.shab.ch/api/v1/publications`
- **Property auctions** (sub-rubric SB01)
- **Complete XML retention** for audit trail and reprocessing

## Contributing

### Development Workflow
1. **Create feature branch** from `main`
2. **Make changes** following existing patterns
3. **Run tests**: `npm test` in relevant service directory
4. **Check database**: `npm run db:status` to verify changes
5. **Create PR** with descriptive commit messages

### Code Organization
- **Services**: Independent deployable units with their own dependencies
- **Shared libraries**: Common utilities used across services
- **Database**: Centralized schema shared by all services
- **Type safety**: Full TypeScript coverage with Prisma-generated types

### Testing
```bash
# Collector service tests
cd services/collector-node
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:database    # Database connectivity

# Web application tests
cd services/webapp
npm test

# Python ETL service tests
cd services/etl-py
pytest                   # Python unit tests
```

## Implementation Status

### ✅ Completed
- Service-oriented architecture with proper separation
- SHAB API integration with XML parsing and storage
- Database schema with Prisma ORM and PostGIS support
- Historical backfill system with batch processing
- Comprehensive database management scripts
- Multi-language auction data collection (DE/FR/IT)

### 🚧 Current Work
- Service architecture restructuring (feature branch)
- Database optimization and indexing
- Error handling and retry logic improvements

### 📋 Planned
- **LLM Integration**: Property description parsing and classification
- **Python ETL Service**: ML pipelines for data enrichment
- **Geocoding**: Address-to-coordinates conversion
- **Web Interface**: Search, filtering, and map visualization
- **API Layer**: RESTful endpoints for auction data access
- **Monitoring**: Logging, metrics, and alerting infrastructure

## Environment Variables

**Required for collector-node:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/auctiondeal_dev"
```

**Required for etl-py:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/auctiondeal_dev"
OPENAI_API_KEY="your-openai-api-key"  # For LLM processing
```

## Support

For questions about the codebase, architecture decisions, or contribution guidelines, check the documentation in the `docs/` directory or create an issue.