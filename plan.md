# Service Architecture Restructuring Plan

## Overview
Transform current monolithic structure into professional service-oriented architecture with clear boundaries, shared libraries, and proper abstractions.

**Branch**: `feature/service-architecture-restructure`  
**Timeline**: 8-12 days estimated  
**Safety**: Each phase creates working state with git commit  

## 🎯 Progress Status

**✅ Completed Phases:**
- **Phase 1**: Directory structure setup - Service-oriented directories created, webapp safely moved
- **Phase 2**: Shared libraries foundation - TypeScript & Python utilities, centralized database schema  
- **Phase 3**: Contracts & schema generation - JSON schemas, TypeScript/Python type generation working

**🔄 Current Phase:**
- **Phase 4**: Extract collector service from webapp (In Progress)

**⏳ Remaining Phases:**
- **Phase 5**: Create ETL Python service foundation
- **Phase 6**: Implement message queue integration  
- **Phase 7**: Add infrastructure and DevOps tooling
- **Phase 8**: Final integration, testing and documentation

## Architecture Decisions
- **Schema Generation**: Pydantic models generated from JSON Schema
- **Database**: Prisma (existing setup, centralized)
- **Job Scheduling**: Simple cron jobs (Vercel compatible)
- **Service Communication**: Message queue for ETL notifications
- **Queue System**: Redis/BullMQ for reliability

## Target Structure
```
auctiondeal/
  services/
    webapp/                  # Next.js (UI + read-only API)
    collector-node/          # Node.js SHAB collector
    etl-py/                  # Python LLM processing
  libs/
    contracts/               # Schema definitions & codegen
    shared-ts/               # TypeScript utilities
    shared-py/               # Python utilities
  db/
    migrations/              # Prisma migrations
    seed/                    # Development data
  ops/
    docker/                  # Containerization
    scripts/                 # Automation scripts
  notebooks/                 # Data science
  data/                      # Development data
  docs/                      # Documentation
```

---

## Phase 1: Directory Structure Setup ✅

### 1.1 Create Top-Level Directories
```bash
# Create main service directories
mkdir -p services/{webapp,collector-node,etl-py}

# Create shared libraries structure
mkdir -p libs/{contracts,shared-ts,shared-py}
mkdir -p libs/contracts/codegen/{ts,py}

# Create database directory
mkdir -p db/{migrations,seed}

# Create operations directory
mkdir -p ops/{docker,scripts,github/workflows}

# Verify structure
tree -d -L 3
```

### 1.2 Move Existing Webapp
```bash
# Preserve git history with git mv
git mv auctiondeal-app services/webapp

# Update any references to old path in documentation
# (manual step - check docs/ and README.md)
```

### 1.3 Commit Structure Creation
```bash
git add -A
git commit -m "Phase 1: Create service-oriented directory structure

- Create services/, libs/, db/, ops/ directories
- Move auctiondeal-app to services/webapp
- Preserve git history with git mv"
```

**Validation**: All existing webapp functionality should work from new location

---

## Phase 2: Shared Libraries Foundation ✅

### 2.1 Database Library (libs/shared-ts)
Create `libs/shared-ts/src/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

export const getPrismaClient = () => {
  if (typeof window !== 'undefined') return null
  
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  
  prisma = global.__prisma
  return prisma
}

export const db = getPrismaClient()
export default db
```

### 2.2 Shared TypeScript Package Setup
Create `libs/shared-ts/package.json`:
```json
{
  "name": "@auctiondeal/shared-ts",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 2.3 Move Database Schema
```bash
# Move Prisma schema to centralized location
git mv services/webapp/prisma db/

# Update schema location in webapp
# Edit services/webapp/package.json - update prisma schema path
```

### 2.4 Shared Python Library Setup
Create `libs/shared-py/pyproject.toml`:
```toml
[project]
name = "auctiondeal-shared-py"
version = "1.0.0"
description = "Shared Python utilities for Auctiondeal services"
requires-python = ">=3.11"
dependencies = [
    "psycopg[binary]>=3.1.0",
    "pydantic>=2.0.0",
    "structlog>=23.0.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

### 2.5 Commit Shared Libraries
```bash
git add -A
git commit -m "Phase 2: Create shared libraries foundation

- Add libs/shared-ts with database utilities
- Add libs/shared-py project structure  
- Move prisma schema to db/ directory
- Set up package structure for shared code"
```

---

## Phase 3: Contracts and Schema Generation ✅

### 3.1 Core Schema Definitions
Create `libs/contracts/schemas/auction.schema.json`:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Auction",
  "type": "object",
  "properties": {
    "id": {"type": "string", "format": "uuid"},
    "status": {"type": "string", "enum": ["active", "cancelled", "completed"]},
    "auctionDate": {"type": "string", "format": "date"},
    "auctionTime": {"type": "string", "format": "time"},
    "auctionLocation": {"type": "string"},
    "registrationDeadline": {"type": "string", "format": "date-time"},
    "responsibleOffice": {"type": "string"}
  },
  "required": ["id", "status", "auctionDate"]
}
```

### 3.2 Code Generation Scripts
Create `libs/contracts/scripts/generate.sh`:
```bash
#!/bin/bash
set -e

echo "Generating TypeScript types..."
npx json-schema-to-typescript schemas/*.json --outDir codegen/ts/

echo "Generating Pydantic models..."
datamodel-codegen --input schemas/ --output codegen/py/ --output-model-type pydantic.BaseModel
```

### 3.3 Generated Types Integration
```bash
# Run code generation
cd libs/contracts
chmod +x scripts/generate.sh
./scripts/generate.sh
```

### 3.4 Commit Contract System
```bash
git add -A
git commit -m "Phase 3: Implement schema-driven contracts

- Add JSON Schema definitions for core data types
- Create code generation pipeline for TS/Python
- Generate initial type definitions
- Set up contract-first development approach"
```

---

## Phase 4: Extract Collector Service 🔄 (In Progress)

### 4.1 Create Collector Package Structure
```bash
cd services/collector-node
npm init -y
```

### 4.2 Extract SHAB Processor
```bash
# Find existing SHAB processor
find services/webapp -name "*shab*" -type f

# Move SHAB processing code (adjust paths based on actual location)
mkdir -p services/collector-node/src/{sources,parsers,jobs}
git mv services/webapp/src/lib/services/shab-processor.ts services/collector-node/src/sources/shab.ts
```

### 4.3 Create Collector Entry Point
Create `services/collector-node/src/index.ts`:
```typescript
import { createServer } from 'http'
import { scheduleShabJob } from './jobs/shab-daily'
import { setupTelemetry } from './telemetry'
import config from './config'

async function bootstrap() {
  setupTelemetry()
  
  // Start health check server
  const server = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', service: 'collector-node' }))
    } else {
      res.writeHead(404)
      res.end()
    }
  })
  
  server.listen(config.port, () => {
    console.log(`Collector service running on port ${config.port}`)
  })
  
  // Schedule jobs
  scheduleShabJob()
}

bootstrap().catch(console.error)
```

### 4.4 Update Webapp - Remove Collector Code
```bash
# Remove collector-related API routes from webapp
# Remove cron jobs that are now handled by collector
# Update imports and references
```

### 4.5 Commit Collector Extraction
```bash
git add -A
git commit -m "Phase 4: Extract collector as independent service

- Create services/collector-node with proper Node.js structure
- Move SHAB processor from webapp to collector service
- Set up independent service with health checks
- Remove collector responsibilities from webapp"
```

---

## Phase 5: Create ETL Python Service ⏳

### 5.1 Python Service Structure
```bash
cd services/etl-py
mkdir -p etl_py/{processors,extractors,normalizers}
```

### 5.2 Create Python Package
Create `services/etl-py/pyproject.toml`:
```toml
[project]
name = "auctiondeal-etl"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "pydantic>=2.0.0",
    "openai>=1.0.0",
    "langchain>=0.1.0",
    "psycopg[binary]>=3.1.0",
    "redis>=5.0.0",
    "structlog>=23.0.0",
]
```

### 5.3 Basic ETL Structure
Create `services/etl-py/etl_py/main.py`:
```python
import asyncio
from fastapi import FastAPI
from .processors.llm_extractor import LLMExtractor
from .config import settings

app = FastAPI(title="Auctiondeal ETL Service")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "etl-py"}

@app.post("/extract")
async def extract_auction_data(raw_data: dict):
    extractor = LLMExtractor()
    return await extractor.extract(raw_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### 5.4 Commit ETL Service
```bash
git add -A
git commit -m "Phase 5: Create Python ETL service foundation

- Add services/etl-py with FastAPI structure
- Set up LLM processing framework
- Create basic API endpoints for extraction
- Configure Python dependencies and project structure"
```

---

## Phase 6: Message Queue Integration ⏳

### 6.1 Queue Configuration
Add to `libs/shared-ts/src/queue.ts`:
```typescript
import Redis from 'ioredis'
import { Queue } from 'bullmq'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const dataCollectionQueue = new Queue('data-collection', {
  connection: redis,
})

export const etlProcessingQueue = new Queue('etl-processing', {
  connection: redis,
})

export { redis }
```

### 6.2 Update Collector to Publish Events
Update collector to publish messages when data is collected

### 6.3 Update ETL to Consume Events
Set up ETL service to process messages from queue

### 6.4 Commit Queue Integration
```bash
git add -A
git commit -m "Phase 6: Implement message queue communication

- Add Redis/BullMQ integration to shared libraries
- Update collector to publish data collection events
- Configure ETL service to consume processing messages
- Enable reliable service-to-service communication"
```

---

## Phase 7: Infrastructure and DevOps ⏳

### 7.1 Docker Configuration
Create `ops/docker/docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: auctiondeal_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  webapp:
    build:
      context: ../../
      dockerfile: ops/docker/webapp.Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  collector:
    build:
      context: ../../
      dockerfile: ops/docker/collector-node.Dockerfile
    depends_on:
      - postgres
      - redis

  etl:
    build:
      context: ../../
      dockerfile: ops/docker/etl-py.Dockerfile
    ports:
      - "8001:8001"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 7.2 Individual Dockerfiles
Create Dockerfiles for each service in `ops/docker/`

### 7.3 Development Scripts
Create `ops/scripts/dev-setup.sh`:
```bash
#!/bin/bash
set -e

echo "Setting up Auctiondeal development environment..."

# Install dependencies for all services
cd services/webapp && npm install
cd ../collector-node && npm install
cd ../etl-py && pip install -e .
cd ../../libs/shared-ts && npm install

# Generate contracts
cd libs/contracts && ./scripts/generate.sh

# Setup database
cd db && npx prisma migrate dev

echo "Development environment ready!"
echo "Run: docker-compose -f ops/docker/docker-compose.dev.yml up"
```

### 7.4 Commit Infrastructure
```bash
git add -A
git commit -m "Phase 7: Add infrastructure and development tooling

- Create Docker Compose setup for local development
- Add individual Dockerfiles for all services
- Create development setup scripts
- Configure multi-service development environment"
```

---

## Phase 8: Final Integration and Documentation ⏳

### 8.1 Update Root Documentation
Update `README.md` with new architecture and setup instructions

### 8.2 Service-Specific Documentation
Create README.md for each service with specific setup instructions

### 8.3 Architecture Documentation
Update `docs/auctiondeal_architecture.md` with new service architecture

### 8.4 Environment Configuration
Create `.env.example` with all required environment variables for all services

### 8.5 Final Integration Testing
```bash
# Run full system test
./ops/scripts/smoke.sh

# Verify all services can communicate
# Test data flow: collector → database → etl → database → webapp
```

### 8.6 Final Commit
```bash
git add -A
git commit -m "Phase 8: Complete service architecture migration

- Update all documentation for new architecture
- Add comprehensive setup instructions
- Create service-specific documentation
- Verify full system integration
- Ready for production deployment"
```

---

## Post-Migration Validation Checklist

### Functional Testing
- [ ] Webapp loads and displays data correctly
- [ ] Collector can fetch SHAB data independently  
- [ ] ETL service processes data via message queue
- [ ] All services can connect to shared database
- [ ] Health checks respond for all services

### Development Workflow
- [ ] `npm run dev` works for webapp
- [ ] `npm start` works for collector
- [ ] `python -m etl_py.main` works for ETL service
- [ ] Docker Compose brings up full environment
- [ ] Database migrations run successfully

### Code Quality
- [ ] All shared libraries properly imported
- [ ] Generated types are used consistently
- [ ] No circular dependencies between services
- [ ] Proper error handling and logging
- [ ] Clean separation of concerns

### Documentation
- [ ] README.md reflects new architecture
- [ ] Service documentation is complete
- [ ] Development setup instructions work
- [ ] Architecture diagrams are updated

---

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: `git checkout main`
2. **Partial Rollback**: Cherry-pick specific commits to revert
3. **Service Rollback**: Temporarily disable problematic service
4. **Database Rollback**: Use Prisma migration rollback

Each phase creates a stable commit point for granular rollback if needed.

---

## Success Metrics

### Technical
- All services run independently
- Message queue handles 1000+ messages/hour
- Database connections properly pooled
- Memory usage per service < 100MB
- Response times < 200ms for API calls

### Development
- New features can be developed in isolation
- Shared code changes propagate correctly
- Development environment setup < 5 minutes
- All tests pass in CI/CD pipeline

### Architecture
- Clear service boundaries maintained
- No cross-service direct dependencies
- Proper abstraction layers implemented
- Database schema centrally managed
- Contracts enforce type safety