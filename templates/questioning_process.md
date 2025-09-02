# Context-Aware Iterative Questioning Process

## Initial Setup Phase

### 1. Product Name Collection
**First Question:** "What's your product/project name?"
- Use response to create filename: `{productName}_prd.md`
- Include product name in document title and headers
- Reference product name consistently throughout questioning

### 2. Context Discovery
**Read existing initial.md (if present):**
- Extract any product ideas, requirements, or constraints already documented
- Identify target users, platforms, or technical preferences mentioned
- Note any business context, timelines, or success criteria provided

**Scan context folder:**
- Look for research files, user interviews, competitive analysis
- Check for existing wireframes, mockups, or technical specifications  
- Identify market research, business cases, or strategic documents
- Review any existing user feedback, support tickets, or analytics

**Analyze codebase context (if applicable):**
- Review README files for product description and technical stack
- Check package.json, requirements.txt, or similar for technology preferences
- Look for existing user models, API schemas, or data structures

### 2. Context Integration
**Synthesize existing information:**
- Create a baseline understanding of the product vision
- Identify gaps where additional information is needed
- Note potential contradictions that need resolution
- Determine which template sections can be pre-populated

## Section-by-Section Questioning

### Problem & Opportunity Section

**Context Check:** Review existing problem statements, user research, business cases

**Question Strategy:**
- If problem is well-defined in context: "I found this problem definition in your materials: [quote]. Is this accurate, or would you like to refine it?"
- If problem is partially defined: "Based on your context, it seems you're solving [interpreted problem]. Can you help me complete this understanding?"
- If no problem context: "What specific user problem does this product solve? Can you give me a concrete example?"

**Three-Option Response:**
1. **User provides context:** User gives detailed problem description
2. **Claude makes contextual proposition:** "Based on your research mentioning [context], I suggest this problem statement: [proposal]"
3. **Leave open:** Skip this section for now, mark as [TBD]

### Success Metrics Section

**Context Check:** Look for existing KPIs, business goals, analytics data, success criteria

**Question Strategy:**
- If metrics exist: "I see you've mentioned [existing metrics]. Should [specific metric] be your north star KPI?"
- If business goals exist: "Your business goal of [goal] suggests these potential metrics: [options]. Which resonates?"
- If no metrics context: "How will you measure if this product is successful? What's the one metric that matters most?"

**Claude Contextual Propositions:**
- Based on user type: "For [identified user type], typical north star metrics are [options]"
- Based on business model: "Given [business context], I'd suggest [specific KPI] as your north star"
- Based on industry: "Products like yours often measure success through [relevant metrics]"

### Target Users & Critical Journeys Section

**Context Check:** User research, personas, customer feedback, support data, existing user base

**Question Strategy:**
- If personas exist: "I found these user types in your research: [list]. Are these your primary personas?"
- If user feedback exists: "Your support data shows [patterns]. Does this reflect your target users?"
- If no user context: "Who are your primary users? Can you describe their typical day/workflow?"

**Journey Mapping:**
- Use existing user research to propose journey steps
- Reference support tickets or feedback to identify friction points
- Suggest journeys based on identified user types and goals

### Solution Scope Section

**Context Check:** Existing features, technical constraints, platform preferences, business requirements

**Question Strategy:**
- If features are mentioned: "You've outlined [features]. Are these your MVP features?"
- If technical constraints exist: "I see you're using [tech stack]. Any constraints this creates?"
- If platform preferences exist: "You mentioned [platforms]. Are these your target platforms?"

**User Story Generation:**
- Convert existing feature ideas into user story format
- Reference personas from context to create "As a [persona]..." stories
- Use journey mapping to ensure stories cover critical paths

### Release Plan Section

**Context Check:** Timeline mentions, resource constraints, business deadlines, competitive pressures

**Question Strategy:**
- If timelines exist: "You mentioned [timeline]. Is this for MVP or full release?"
- If constraints exist: "Given [constraints], what's realistic for initial launch?"
- If no timeline: "When do you need this launched? What's driving that timeline?"

## Validation & Consistency Checking

### Cross-Section Validation
**Check for contradictions:**
- Do proposed features serve identified personas?
- Do success metrics align with user journeys?
- Are non-functional requirements realistic for timeline?
- Do technical constraints match platform goals?

**Resolution Strategy:**
- Present contradiction: "I notice [conflict]. How should we resolve this?"
- Offer prioritization: "We can't do both [option A] and [option B] in MVP. Which is more critical?"
- Suggest phasing: "This seems like a Phase 2 feature given [constraint]. Should we move it?"

### Context Consistency Check
**Validate against original context:**
- Does final PRD align with initial.md vision?
- Are we staying true to research findings?
- Have we addressed constraints mentioned in context folder?

## Final Presentation Process

### 1. Pre-Presentation Review
- Ensure all sections flow logically
- Check that metrics ladder up to business goals
- Verify user stories support identified journeys
- Confirm technical feasibility given constraints

### 2. Presentation Format
**Show context integration:**
"Based on your [context sources], I've created this PRD that builds on your existing [vision/research/constraints]."

**Highlight key decisions:**
"Key decisions made: [list major choices and rationale]"

**Flag areas needing validation:**
"Please review these sections where I made assumptions: [list]"

### 3. Iteration Handling
**For requested changes:**
- Update all affected sections for consistency
- Re-validate cross-section dependencies
- Check impact on timeline/scope

**For new information:**
- Integrate smoothly with existing content
- Update related sections automatically
- Flag any new contradictions created

## AI Context Generation

### For Claude Code Development
**Extract technical context:**
- Preferred frameworks and libraries from codebase
- Existing data models and API patterns
- Code quality standards and testing approaches

**Generate development guidance:**
- Architecture patterns that fit existing codebase
- Integration points with current systems
- Performance requirements for AI implementation

**Create structured context files:**
- Update CLAUDE.md with PRD-derived context
- Generate .cursorrules for development preferences
- Create development checklist from acceptance criteria