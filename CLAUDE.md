# PRD Creation System

This project uses the Claude PRD Template System for structured product requirements.

## Quick Start

1. **Edit `context/initial.md`** with your project description
2. **Run `/prd_create_base`** to create your initial PRD
3. **Use `/prd_expand`** for detailed specifications

## Commands Available

- **`/prd_create_base`** - Create focused one-page PRD (5-10 minutes)
- **`/prd_expand`** - Expand to comprehensive specifications

## How It Works

The system uses context-aware questioning to build PRDs tailored to your specific project:
- Reads your project files to ask smart questions
- Updates PRD files immediately with each input
- Shows diff previews of changes
- Processes items one-by-one (no overwhelming lists)

## PRD Decision Tracking

This system automatically tracks decisions and context across sessions:

### Current PRD Status
- **Active PRD**: Auctiondeal PRD (Restructuring in Progress)
- **Last Session**: 2025-09-04 - PRD Clean-up & Restructuring
- **Phase**: Creating Clean PRD Structure  
- **Current Work**: Building `auctiondeal_prd1.md` with 12-chapter template structure

### Key Decisions Made
- **Product Focus**: Swiss foreclosure auction aggregation platform
- **3-Phase Strategy**: MVP (basic aggregation) → Phase 1 (subscriptions, advanced features) → Phase 2 (data enrichment) → Phase 3 (international)
- **30-Day MVP Timeline**: End September 2025 go-live target
- **Revenue Model**: Subscription-based with freemium approach

### Session Context
*Current session context and discovered information*
- **Project Type**: B2C SaaS marketplace platform
- **Technical Stack**: SHAB XML scraping, map-based web interface, analytics integration
- **Key Stakeholders**: Swiss private investors and small real estate companies
- **Market Validation**: Comprehensive Swiss auction market analysis complete

### Template Customizations
*Track any modifications to templates or processes*

---

## Need Help?

For detailed documentation, examples, and guidance, see the [template documentation](https://github.com/ilPicc0ne/claude-prd-template).

---

**Ready to start?** Edit `context/initial.md` with your project idea and run `/prd_create_base`!

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