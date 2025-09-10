### Before starting work

- Always in plan mode to make a plan
- After get the plan, make sure you Write the plan to .claude/tasks/TASK_NAME.md.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing

- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Current Project: Service Architecture & Data Pipeline Implementation

**Branch**: `feature/service-architecture-restructure`  
**Status**: Core infrastructure complete, implementing data processing pipeline

### Architecture Overview

Service-oriented architecture with specialized backend services:

- **services/webapp/**: Next.js 15 web application
- **services/collector-node/**: Node.js SHAB data collection service (✅ Complete)
- **services/etl-py/**: Python ETL & LLM processing service (📋 Planned)
- **libs/shared-ts/**: TypeScript utilities with Prisma client (✅ Complete)
- **db/**: PostgreSQL with PostGIS, centralized schema (✅ Complete)
- **ops/**: Infrastructure and deployment configuration

### Current Implementation Status

**✅ Completed:**
- Service-oriented directory structure and separation
- SHAB API integration with XML parsing and storage
- Database schema with 147 publications (441 total records)
- Historical backfill system with comprehensive management scripts
- Multi-language auction data collection (German/French/Italian)

**🚧 Current Focus:**
- **LLM-Powered Data Extraction (First Stage)**: Implementing Python ETL service for intelligent property data processing
  - Property description parsing from raw SHAB auction text (German/French/Italian)
  - Automated classification into property types (Land, MFH, EFH, Commercial, Parking, Various)
  - Estimated value extraction from unstructured auction text
  - Address normalization and geocoding preparation
  - Confidence scoring for LLM extraction results

**📋 Next Phase:**
- Advanced property classification and enrichment pipeline
- Geocoding integration for map visualization
- Web interface development with search, filtering, and map visualization
- API layer for auction data access

## Development Environment

### Database Connection
```bash
DATABASE_URL="postgresql://dev:devpassword@localhost:5432/auctiondeal_dev"
```

### Service Endpoints
- **Web Application**: http://localhost:3000 (Next.js dev server)
- **Collector Service**: Background process (no HTTP endpoint)
- **Database**: localhost:5432 (PostgreSQL with PostGIS)

### Key Commands
```bash
# Database management (from services/collector-node/)
npm run db:status          # Current database statistics
npm run db:backfill [days] # Historical data collection
npm run db:clear           # Safe database clearing

# Development servers
cd services/webapp && npm run dev         # Web application
cd services/collector-node && npm run dev # Data collection service
```

### Current Database Status
- **147 SHAB Publications** (June 12 - September 5, 2025)
- **441 Total Records** across all tables
- **Multi-language**: German (70), French (51), Italian (26)
- **Coverage**: All major Swiss cantons

## Project Documentation Structure

### Core PRD Files

- **`docs/auctiondeal_prd1.md`** - Main Product Requirements Document (clean template structure, in progress)
- **`docs/auctiondeal_prd.md`** - Legacy PRD (will be marked obsolete once prd1 is complete)
- **`docs/auctiondeal_decisions.md`** - Decision tracking log with session history
- **`context/prd_template.md`** - 12-chapter PRD template structure

**Note**: PRD and decisions files are maintained only in docs/ folder for centralized documentation

### Technical Documentation

- **System Architecture**: See `docs/auctiondeal_architecture.md` for complete technical specifications
  - Database schema design (3-table structure: auctions, objects, shab_publications)
  - Data processing pipeline workflows
  - LLM integration and confidence scoring
  - Performance optimization strategies
- **SHAB API Interface**: See `docs/shab-api-interface.md` for complete Swiss Commercial Gazette API documentation
  - Primary data source for auction listings
  - Daily scraping implementation guidance
  - XML content parsing specifications
- **Sample XML Structure**: Real SHAB XML files for development reference and field mapping
  - `context/SB01-0000004345.xml` - Basic auction structure with estimated value in auctionObjects
  - `context/SB01-0000004347.xml` - With Besichtigung data in remarks field
- **Data Extraction Challenge**: `auctionObjects` and `remarks` contain unstructured text requiring LLM-powered parsing

### Git Workflow

- After each accepted change, create a meaningful git commit
- All documentation maintained centrally in docs/ folder
- never add any reference to claude to commit or any files
- remove any claude reference from commits
