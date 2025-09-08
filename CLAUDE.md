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

## Current Project: Service Architecture Restructuring

**Branch**: `feature/service-architecture-restructure`  
**Plan**: See `plan.md` for complete implementation roadmap  
**Status**: Ready to execute phase-by-phase migration  

### Migration Overview
Transforming monolithic structure into professional service-oriented architecture:
- **services/**: webapp, collector-node, etl-py
- **libs/**: shared-ts, shared-py, contracts  
- **db/**: centralized database management
- **ops/**: infrastructure and deployment

### Execution Strategy
- 8 phases with git commits at each milestone
- Safety: each phase results in working state
- Rollback: git branch allows safe experimentation
- Progress tracking: update this file after each phase completion

**Ready to start?** Execute `plan.md` phase by phase

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
