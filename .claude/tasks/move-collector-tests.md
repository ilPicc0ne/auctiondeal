# Move Collector Tests from Webapp to Collector-Node

## Current Situation
- Collector tests are in `services/webapp/scripts/` (8 test files)
- Tests import from webapp's SHAB services which have been extracted to collector
- Need to migrate tests to `services/collector-node/tests/` and fix dependencies

## Implementation Plan

### Phase 1: Test File Migration
1. **Copy test files** from `services/webapp/scripts/` to `services/collector-node/tests/`
   - `test-db-connection.ts`
   - `test-duplicate-avoidance.ts` 
   - `test-shab-api-direct.ts`
   - `test-shab-pipeline.ts`
   - `test-comprehensive-integration.ts`
   - `test-database-validation.ts`
   - `test-shab-volume.ts`
   - `test-backfill-completeness.ts`

### Phase 2: Import Path Updates
2. **Update import statements** in each test file:
   - Change `'../src/lib/services/shab-api'` to `'../src/lib/shab-api.js'`
   - Change `'../src/lib/services/shab-processor'` to `'../src/lib/shab-processor.js'`
   - Verify all imports match the new collector-node structure

### Phase 3: Jest Configuration Setup
3. **Add Jest configuration** for ES modules:
   - Create `jest.config.js` with ES module support
   - Configure TypeScript compilation
   - Set up proper test environment

### Phase 4: Package Dependencies
4. **Update collector-node package.json**:
   - Add missing test dependencies (`@types/jest`, test utilities)
   - Configure test scripts

### Phase 5: Test Validation
5. **Run tests and fix issues**:
   - Run each test individually to identify problems
   - Fix any remaining import/dependency issues
   - Ensure all tests pass

## Technical Details

### Current Test Import Patterns (webapp):
```typescript
import { ShabApiService, ShabApiError } from '../src/lib/services/shab-api';
import { shabProcessorService } from '../src/lib/services/shab-processor';
```

### New Import Patterns (collector-node):
```typescript
import { ShabApiService, ShabApiError } from '../src/lib/shab-api.js';
import { shabProcessorService } from '../src/lib/shab-processor.js';
```

### Jest Configuration Requirements:
- ES module support (`"type": "module"` in package.json)
- TypeScript compilation
- Proper extension handling for `.js` imports

## Success Criteria
- All 8 test files successfully moved to collector-node/tests/
- All imports updated to use collector-node service paths
- Jest configured and running properly
- All tests passing without errors
- Test scripts added to collector-node package.json