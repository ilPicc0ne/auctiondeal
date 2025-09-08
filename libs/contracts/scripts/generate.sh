#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Generating types from JSON schemas...${NC}"

# Create output directories
mkdir -p codegen/ts codegen/py

# Check if required tools are installed
if ! command -v json-schema-to-typescript &> /dev/null; then
    echo -e "${RED}❌ json-schema-to-typescript not found. Installing...${NC}"
    npm install -g json-schema-to-typescript
fi

if ! command -v datamodel-codegen &> /dev/null; then
    echo -e "${RED}❌ datamodel-codegen not found. Installing...${NC}"
    pip install datamodel-code-generator
fi

echo -e "${BLUE}📝 Generating TypeScript types...${NC}"

# Generate TypeScript types from each schema
for schema_file in schemas/*.schema.json; do
    filename=$(basename "$schema_file" .schema.json)
    echo "  - Generating ${filename}.ts"
    
    json-schema-to-typescript "$schema_file" > "codegen/ts/${filename}.ts"
done

# Create TypeScript index file
echo -e "${BLUE}📦 Creating TypeScript index file...${NC}"
cat > codegen/ts/index.ts << 'EOF'
// Auto-generated type exports
export * from './auction';
export * from './auction-object';
export * from './shab-publication';
EOF

echo -e "${BLUE}🐍 Generating Python Pydantic models...${NC}"

# Generate Python models
datamodel-codegen \
    --input schemas/ \
    --output codegen/py/ \
    --output-model-type pydantic.BaseModel \
    --field-constraints \
    --use-title-as-name \
    --target-python-version 3.11

# Create Python __init__.py file
echo -e "${BLUE}📦 Creating Python package file...${NC}"
cat > codegen/py/__init__.py << 'EOF'
"""Auto-generated Pydantic models from JSON schemas."""

from .schemas_auction_schema import Auction
from .schemas_auction_object_schema import AuctionObject  
from .schemas_shab_publication_schema import ShabPublication

__all__ = [
    "Auction",
    "AuctionObject", 
    "ShabPublication",
]
EOF

echo -e "${GREEN}✅ Code generation completed!${NC}"
echo -e "${GREEN}   TypeScript types: codegen/ts/${NC}"
echo -e "${GREEN}   Python models: codegen/py/${NC}"