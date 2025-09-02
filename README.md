# Claude PRD Template System

Create professional Product Requirement Documents (PRDs) using Claude Code with contextual intelligence and interactive workflows.

> **📁 For Your Projects**: When you clone this template into your project, you'll get a clean setup with minimal documentation focused on your work. This README serves as the comprehensive guide for understanding and using the template system.

## Quick Start

### Prerequisites Check
Before starting, ensure you have:
- ✅ **[Claude Pro subscription](https://claude.ai/upgrade)** (required for Claude Code)
- ✅ **[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)** installed and working
- ✅ **Recommended**: IDE with Claude Code plugin:
  - **[Cursor](https://cursor.sh/)** with [Claude Code integration](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)
  - **[Windsurf](https://codeium.com/windsurf)** with [Claude Code integration](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)
  - **[VS Code](https://code.visualstudio.com/)** with [Claude Code extension](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)

### Setup Steps

1. **Clone this repository into your project folder:**
   ```bash
   git clone https://github.com/ilPicc0ne/claude-prd-template.git .
   ```

2. **Add your project context:**
   - Edit `context/initial.md` with your basic project idea (2-3 sentences)
   - Add any additional context files to the `context/` directory (user research, requirements, existing specs, etc.)

3. **Create your PRD:**
   ```bash
   # Generate initial one-page PRD
   /prd_create_base
   
   # Expand to detailed specifications
   /prd_expand
   ```

> **💡 Pro Tip**: Use an IDE with Claude Code integration to see real-time file updates and diff previews as your PRD builds!

## What You Get

### 📋 PRD Templates
- **One-Pager**: Quick stakeholder alignment (5 focused sections)
- **Detailed PRD**: Comprehensive 5-chapter specifications
- **Context-Aware**: Uses your project information for tailored questions

### ⚠️ What's NOT Included: Business Requirements Brief (BRB)

This system focuses on **Product** Requirements Documents, not Business Requirements. A **Business Requirements Brief (BRB)** may be needed as an earlier step for strategic planning:

**BRB typically contains:**
- Market analysis and opportunity sizing
- Business case and ROI projections
- Strategic objectives and success criteria
- Competitive landscape analysis
- Go-to-market strategy
- Resource and budget requirements

**When you need a BRB first:**
- New product category or market entry
- Significant strategic initiatives
- Products requiring executive/board approval
- Complex business model validation

**Our PRD system assumes** you've already validated the business opportunity and focuses on **what to build** and **how users will interact** with the solution.

### 🤖 Claude Commands
- `/prd_create_base` - Interactive PRD creation with immediate file updates
- `/prd_expand` - Item-by-item expansion from one-pager to detailed specs

### ⚡ Key Features
- **Immediate Updates**: PRD files created/updated after each input
- **Diff Previews**: See exactly what changes with each step
- **Item-by-Item**: Process user stories, features, personas one at a time
- **Context Intelligence**: Smart questions based on your project details
- **Decision Tracking**: Automatic logging of decisions, rationale, and context across sessions
- **Session Continuity**: Expansion phase references and builds on base creation decisions

## How It Works

### Stage 1: One-Pager Creation (`/prd_create_base`)
1. **Context Analysis**: Reads your `initial.md` and scans `context/` folder for additional files
2. **Smart Questioning**: Asks only relevant, non-redundant questions based on existing context
3. **Immediate Building**: Updates PRD file with each input
4. **Decision Tracking**: Automatically logs key decisions and rationale
5. **5 Core Sections**: 
   - Problem & Opportunity (user pain + business driver)
   - Solution Concept (what we're building + value prop)
   - Target Users & Success Metrics (personas + KPIs)
   - Critical User Journey (main happy path)
   - MVP Scope (core capabilities + constraints)

### Stage 2: Detailed Expansion (`/prd_expand`)
1. **Foundation Preservation**: References validated one-pager decisions and their rationale
2. **Progressive Development**: Expands one item at a time (user stories, features, personas)
3. **Real-Time Evolution**: Watch your document grow incrementally
4. **Decision Continuity**: Builds on previous decisions while tracking new ones
5. **5 Comprehensive Chapters**: Complete development specifications
   - Problem Definition & Strategic Context
   - Solution Architecture & Scope
   - User Context & Personas
   - Critical User Journeys (with edge cases)
   - Implementation & Success (user stories + technical guidance + metrics)

## File Structure

```
├── .claude/
│   └── commands/
│       ├── prd_create_base.md        # One-pager creation workflow
│       └── prd_expand.md             # Detailed expansion process
├── context/
│   └── initial.md                    # Your project description
│   └── [additional context files]    # User research, specs, requirements, etc.
├── templates/
│   ├── prd_onepager_template.md      # One-pager structure
│   ├── prd_expansion_template.md     # Detailed PRD structure
│   ├── prd_decisions_template.md     # Decision tracking structure
│   └── questioning_process.md        # Systematic requirements gathering
├── CLAUDE.md                         # Claude Code memory and session tracking
└── README.md                         # This file
```

**Generated Files** (created during PRD process):
- `{productName}_prd.md` - Your PRD document (one-pager → expanded)
- `{productName}_decisions.md` - Decision log with rationale and context

## Output Examples

### One-Pager PRD Sections:
1. **Problem & Opportunity** - Core user pain point + business driver
2. **Solution Concept** - What we're building + value proposition + scope boundaries
3. **Target Users & Success Metrics** - 1-2 primary personas + North Star KPI + sub-metrics
4. **Critical User Journey** - 3-5 step main user flow + success moment
5. **MVP Scope** - 3-5 core capabilities + constraints + explicit non-goals

### Detailed PRD Chapters:
1. **Problem Definition & Strategic Context** - Expanded from Problem & Opportunity
2. **Solution Architecture & Scope** - Expanded from Solution Concept + MVP Scope  
3. **User Context & Personas** - Expanded from Target Users & Success Metrics
4. **Critical User Journeys** - Expanded from Critical User Journey (adds edge cases, error handling)
5. **Implementation & Success** - New comprehensive section (detailed user stories, technical guidance, success metrics, release planning)

## Benefits

### For Product Teams
- **Faster PRD Creation**: Hours reduced to minutes with guided questioning
- **Consistent Quality**: Structured templates ensure completeness
- **Stakeholder Alignment**: Clear, focused documentation for go/no-go decisions
- **Decision Transparency**: Automatic tracking of decisions and rationale
- **Iterative Refinement**: Easy updates and expansions with preserved context

### For Development Teams
- **AI-Ready Context**: PRDs optimized for Claude Code development workflows
- **Clear Specifications**: Detailed acceptance criteria and technical guidance
- **Measurable Success**: Defined metrics for feature validation
- **Progressive Disclosure**: Start simple, add detail as needed
- **Decision Context**: Understand the "why" behind requirements through decision logs

### For IDE Integration
- **Real-Time Feedback**: See changes as they happen with immediate file updates
- **Diff Previews**: Transparent update process showing exactly what changed
- **Item-by-Item Flow**: Manageable, non-overwhelming interface processing one element at a time
- **Context Awareness**: Smart suggestions based on existing project files and previous decisions

## Requirements

### Essential Prerequisites
- **[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)** installed and configured
- **[Claude Pro subscription](https://claude.ai/upgrade)** (or higher) - required for Claude Code access
- **Recommended**: IDE with Claude Code integration for optimal experience:
  - **[Cursor](https://cursor.sh/)** with [Claude Code integration](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)
  - **[Windsurf](https://codeium.com/windsurf)** with [Claude Code integration](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)
  - **[VS Code](https://code.visualstudio.com/)** with [Claude Code extension](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)
  - Other compatible IDEs

> **Why IDE integration?** The PRD creation process involves real-time file updates with diff previews. IDEs provide immediate visual feedback as your PRD builds, making it much easier to follow the document evolution and see exactly what changes with each step.

### Project Setup
- Basic project description in `context/initial.md`
- (Optional) Additional context files in `context/` directory:
  - User research and interviews
  - Existing requirements or specifications
  - Technical constraints or architecture docs
  - Business goals and success criteria
  - Competitive analysis or market research

## After Cloning

Once you clone this template into your project:

1. **Your CLAUDE.md will be minimal** - focused on your project, not template documentation
2. **Edit `context/initial.md`** with your project description  
3. **Add relevant context files** to the `context/` directory
4. **Run `/prd_create_base`** to start creating your PRD

The cloned version keeps your project clean while giving you access to all the PRD creation capabilities.

## Roadmap

Planned enhancements to make PRD creation even more powerful:

### 🔍 PRD Review & Analysis
- **Smart Review**: Comprehensive analysis of entire PRD or specific sections
- **Consistency Detection**: Automatically identify inconsistencies across sections
- **Challenge Mode**: Proactively scrutinize and extend PRD elements
- **Gap Analysis**: Detect missing requirements or underspecified areas

### ⚡ Dynamic PRD Management
- **Add Feature**: Seamlessly add new features to existing PRDs with impact analysis
- **Scope Evolution**: Handle scope changes while maintaining decision consistency
- **Stakeholder Feedback Integration**: Incorporate feedback while preserving rationale

### 🎨 Visual PRD Enhancement
- **UX Mockups**: Generate visual mockups directly from user journeys
- **Flow Diagrams**: Create visual user flows to extend PRD clarity
- **Interactive Prototypes**: Bridge the gap between requirements and design
- **Visual Consistency**: Ensure UI/UX decisions align with PRD specifications

*These features will build on the existing decision tracking system to provide even richer context and capabilities for PRD management.*

## Author & Maintainer

**Silvan Geser** - Project Creator & Maintainer
- GitHub: [@ilPicc0ne](https://github.com/ilPicc0ne)
- LinkedIn: [silvan-geser](https://www.linkedin.com/in/silvan-geser/)

> **Preferred Communication**: Please use GitHub Issues for bug reports, feature requests, and project-related questions. This keeps discussions public and searchable for the community. For business inquiries or collaboration opportunities, feel free to connect on LinkedIn.

## Support & Community

- **Questions & Bug Reports**: [GitHub Issues](https://github.com/ilPicc0ne/claude-prd-template/issues) (preferred)
- **General Discussions**: [GitHub Discussions](https://github.com/ilPicc0ne/claude-prd-template/discussions)
- **Template Documentation**: This README (bookmark this page!)
- **Templates**: See templates folder for detailed structures

*Response time: I aim to respond to issues within 5-7 business days. This is a passion project maintained alongside other commitments.*

## License

Open source - feel free to adapt for your team's needs.

---

🚀 **Ready to create your PRD?** Clone this template and run `/prd_create_base` to get started!