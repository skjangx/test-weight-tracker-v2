# **Claude Code Development Guidelines**

## **Project Overview**

**Project:** Weight Tracker - A modern weight tracking application  
**Framework:** Next.js 15 with TypeScript, shadcn/ui, Tailwind CSS  
**Backend:** Supabase (PostgreSQL)  
**Testing:** Playwright (E2E + Visual), Jest (Unit)  
**MCP Integration:** Required use of connected MCP servers for all operations

## **Testing Credentials**

**Test User Account (Development Only - Supabase Auth):**
- **Email:** `testuser3@gmail.com`
- **Password:** `TestPass123!`

**Legacy Test User (No longer valid - Custom JWT system removed):**
- ~~Username: `testuser` / Password: `Test123!`~~ - **DEPRECATED**
- ~~Security Questions system~~ - **REMOVED**

**Database Details:**
- **Project ID:** `duxhaovoqoztxeckdubp`
- **Authentication:** Supabase Auth (email-based)

**Usage Notes:**
- These credentials are for development and testing purposes only
- Use for visual testing, authentication flow testing, and feature development
- Email confirmation is disabled in Supabase settings for immediate login
- All authentication now uses Supabase Auth (no custom JWT or bcrypt)
- **Last Tested:** 2025-09-10 - Full auth flow working (register → login → logout → redirect)

## **1. MCP Server Integration Requirements**

### **1.1 Mandatory MCP Server Usage**

**CRITICAL: All development operations MUST use the connected MCP servers. Direct command-line operations are prohibited.**

#### **Supabase MCP Server (Required)**
- **Database Operations:** Use `mcp__supabase__*` tools for ALL database interactions
- **Schema Management:** Use `apply_migration` for DDL operations, NOT direct SQL
- **Project Setup:** Use `list_projects`, `get_project`, `create_project` for project management
- **Environment:** Use `get_project_url`, `get_anon_key` for configuration
- **Query Execution:** Use `execute_sql` for data operations
- **Logging:** Use `get_logs` for debugging database issues

**Examples:**
```typescript
// ✅ Good: Use MCP server
await mcp__supabase__execute_sql({
  project_id: PROJECT_ID,
  query: "SELECT * FROM weight_entries WHERE user_id = $1",
})

// ❌ Bad: Direct Supabase client
const { data } = await supabase.from('weight_entries').select('*')
```

#### **shadcn/ui MCP Server (Required)**
- **Component Installation:** Use `get_add_command_for_items` for adding components
- **Component Search:** Use `search_items_in_registries` to find components
- **Examples & Demos:** Use `get_item_examples_from_registries` for usage patterns
- **Project Setup:** Use `get_project_registries` to verify configuration

**Examples:**
```bash
# ✅ Good: Use MCP server to get install command
# First search for components
mcp__shadcn__search_items_in_registries(['@shadcn'], 'button')

# Get proper install command
mcp__shadcn__get_add_command_for_items(['@shadcn/button', '@shadcn/input'])

# ❌ Bad: Direct npx commands
npx shadcn add button input
```

#### **Playwright MCP Server (Required)**
- **Test Execution:** Use `mcp__playwright__*` tools for ALL browser automation
- **Browser Control:** Use `browser_navigate`, `browser_click`, `browser_type` for interactions
- **Testing:** Use `browser_snapshot`, `browser_take_screenshot` for validation
- **Installation:** Use `browser_install` if browser installation needed

**Examples:**
```typescript
// ✅ Good: Use MCP server
await mcp__playwright__browser_navigate({ url: 'http://localhost:3000' })
await mcp__playwright__browser_snapshot()

// ❌ Bad: Direct Playwright API
await page.goto('http://localhost:3000')
await page.screenshot()
```

#### **Vercel MCP Server (Required)**
- **Deployment:** Use `deploy_to_vercel` for deployments
- **Project Management:** Use `list_projects`, `get_project` for project info
- **Build Logs:** Use `get_deployment_build_logs` for debugging deployments

### **1.2 MCP Server Verification Protocol**

**Before starting any development task:**
1. **Verify Connected Servers:** Ensure all required MCP servers are active
2. **Test Connectivity:** Run basic commands to verify server responses
3. **Document Server Status:** Note any server issues in implementation logs

**Required MCP Servers Checklist:**
- [ ] Supabase MCP Server connected and responsive
- [ ] shadcn/ui MCP Server connected and responsive  
- [ ] Playwright MCP Server connected and responsive
- [ ] Vercel MCP Server connected and responsive

## **2. Development Standards**

### **2.1 Code Quality Requirements**

- **TypeScript Strict Mode:** All code must be fully typed with no `any` types
- **ESLint Compliance:** Zero linting errors before commits
- **Prettier Formatting:** Code must be properly formatted
- **Component Architecture:** Follow React best practices and patterns
- **Performance:** Components must be optimized (memo, lazy loading, etc.)
- **Accessibility:** WCAG 2.1 Level AA compliance required

### **1.2 Testing Standards**

**Unit Testing (Jest):**
- **100% E2E Test Coverage Required:** All user stories must have corresponding E2E tests
- **Business Logic Coverage:** All business logic and utility functions
- **Component Testing:** Test component behavior, not implementation details  
- **Test File Convention:** `*.test.ts` or `*.test.tsx`
- **Mock External Dependencies:** API calls, third-party libraries
- **Test Structure:** Use `describe` blocks for organization, clear test names

**E2E Testing (Playwright):**
- **User Story Coverage:** Each user story must have corresponding E2E tests
- **Critical Path Testing:** Authentication, data entry, goal setting
- **Cross-Browser Testing:** Chrome, Firefox, Safari
- **Mobile Testing:** Test responsive behavior at mobile breakpoints
- **Visual Regression:** Screenshots at all breakpoints for UI changes

**Test Writing Best Practices:**
```typescript
// ✅ Good: Descriptive test names
describe('WeightEntry Component', () => {
  it('should save weight entry when user presses Enter key', async () => {
    // Arrange
    const mockOnSave = jest.fn()
    render(<WeightEntry onSave={mockOnSave} />)
    
    // Act
    const input = screen.getByLabelText('Weight (kg)')
    await user.type(input, '75.5')
    await user.keyboard('[Enter]')
    
    // Assert
    expect(mockOnSave).toHaveBeenCalledWith({ weight: 75.5 })
  })
})

// ❌ Bad: Vague test names
it('should work', () => {
  // unclear what is being tested
})
```

## **2. Git Workflow & Commit Standards**

### **2.1 Gitmoji Commit Convention**

Follow the [gitmoji guide](https://gitmoji.dev/) for descriptive commits:

**Structure:** `<gitmoji> <type>: <description>`

**Common Emojis:**
- `✨ feat:` New features
- `🐛 fix:` Bug fixes  
- `💄 style:` UI/styling changes
- `♻️ refactor:` Code refactoring
- `✅ test:` Adding/updating tests
- `📝 docs:` Documentation updates
- `🔧 chore:` Configuration changes
- `⚡️ perf:` Performance improvements
- `🚀 deploy:` Deployment related
- `🔒️ security:` Security fixes
- `♿️ a11y:` Accessibility improvements

**Examples:**
```bash
✨ feat: add weight entry form with validation
🐛 fix: resolve date picker timezone issue
💄 style: update goal progress card design
✅ test: add E2E tests for authentication flow
♻️ refactor: extract weight calculation utilities
🔧 chore: update ESLint configuration
```

### **2.2 Commit Grouping & Timing**

**Logical Commit Groups:**

1. **Feature Implementation (per user story):**
   ```bash
   ✨ feat: implement weight goal creation (US-2.1)
   💄 style: add goal progress visualization
   ✅ test: add E2E tests for goal creation
   📝 docs: update API documentation for goals
   ```

2. **Bug Fix Groups:**
   ```bash
   🐛 fix: resolve weight calculation rounding error
   ✅ test: add test case for edge case weight values
   📝 docs: document weight validation rules
   ```

3. **Refactoring Groups:**
   ```bash
   ♻️ refactor: extract date utilities to shared module
   ♻️ refactor: simplify weight calculation logic
   ✅ test: update tests for refactored utilities
   ```

**Commit Timing Guidelines:**
- **Atomic Commits:** Each commit should represent one logical change
- **Working State:** Every commit should leave the app in a working state
- **Feature Branches:** Use feature branches for user stories
- **Daily Commits:** Commit work at least once daily
- **Pre-Push:** Run full test suite before pushing

### **2.3 Branch Naming Convention**

```bash
# Feature branches
feature/US-2.1-goal-creation
feature/US-4.1-weight-graph
feature/US-8.1-dark-mode

# Bug fix branches  
fix/weight-validation-edge-case
fix/mobile-responsive-table

# Refactor branches
refactor/extract-date-utilities
refactor/simplify-auth-flow
```

## **3. Visual Validation Process**

### **3.1 Mandatory Visual Check Protocol**

**IMMEDIATELY after implementing any front-end change, follow this process:**

#### **Step 1: Identify Changes**
- Review modified components/pages
- List affected routes and views
- Identify responsive breakpoints to test

#### **Step 2: Start Development Server**
```bash
npm run dev
```

#### **Step 3: Navigate & Test Each View**
```typescript
// Example Playwright validation script
await page.goto('http://localhost:3000')
await page.waitForLoadState('networkidle')

// Test responsive breakpoints
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' }, 
  { width: 1280, height: 720, name: 'desktop' }
]

for (const viewport of viewports) {
  await page.setViewportSize(viewport)
  await page.screenshot({ 
    path: `screenshots/${route}-${viewport.name}.png`,
    fullPage: true 
  })
}
```

#### **Step 4: Visual Compliance Checklist**
- [ ] **Design System Compliance:** Colors, typography, spacing match DESIGN-SYSTEM.md
- [ ] **Component Consistency:** UI elements follow established patterns
- [ ] **Responsive Behavior:** Layout works at all breakpoints
- [ ] **Accessibility:** Focus states, contrast ratios, screen reader support
- [ ] **Loading States:** Skeletons and spinners display properly
- [ ] **Error States:** Error messages are user-friendly
- [ ] **Empty States:** Proper empty state illustrations and messaging

#### **Step 5: Feature Validation**
- [ ] **User Story Requirements:** Feature fulfills acceptance criteria
- [ ] **Interactive Elements:** Buttons, forms, modals function correctly
- [ ] **Data Display:** Information is presented clearly and accurately
- [ ] **Navigation:** User can complete intended workflows

#### **Step 6: Capture Evidence**
```bash
# Take full page screenshots at all breakpoints
await page.screenshot({ 
  path: `visual-evidence/${feature}-desktop.png`,
  fullPage: true 
})

# Check for console errors
const consoleLogs = await page.evaluate(() => {
  return window.__consoleLogs || []
})
```

#### **Step 7: Console Error Check**
```typescript
// Monitor console messages
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error(`❌ Console error: ${msg.text()}`)
  }
})

// Get accumulated console messages
const messages = await page.evaluate(() => {
  return window.__consoleMessages || []
})
```

### **3.2 Visual Testing Commands**

```bash
# Run visual regression tests
npm run test:visual

# Update visual baselines (after approved changes)  
npm run test:visual:update

# Test specific component
npx playwright test --grep "WeightEntry"

# Test mobile only
npx playwright test --project="Mobile Chrome"
```

## **4. Development Workflow**

### **4.1 Starting New Feature**

1. **Verify MCP Server Status:**
   ```bash
   # Check all required MCP servers are connected
   # Use MCP server verification protocol from Section 1.2
   ```

2. **Create Feature Branch:**
   ```bash
   git checkout -b feature/US-X.X-feature-name
   ```

3. **Review Requirements:**
   - Read user story in PRD.md
   - Check acceptance criteria
   - Review design specifications in DESIGN-SYSTEM.md

4. **Install Required Components (via MCP):**
   ```typescript
   // Use shadcn MCP server for component installation
   // Search for needed components first
   await mcp__shadcn__search_items_in_registries(['@shadcn'], 'button input card')
   
   // Get install commands
   const installCmd = await mcp__shadcn__get_add_command_for_items(['@shadcn/button', '@shadcn/input'])
   ```

5. **Implement with TDD (via MCP):**
   ```bash
   # Write failing E2E test using Playwright MCP server
   await mcp__playwright__browser_navigate({ url: 'http://localhost:3000' })
   
   # Implement feature
   # Make test pass using MCP servers for all operations
   
   # Refactor if needed
   ```

6. **Database Operations (via MCP):**
   ```typescript
   // Use Supabase MCP server for all database operations
   await mcp__supabase__apply_migration({
     project_id: PROJECT_ID,
     name: 'create_weight_entries_table',
     query: 'CREATE TABLE...'
   })
   ```

7. **Visual Validation (via MCP):**
   - Use Playwright MCP server for screenshots
   - Follow mandatory visual check protocol
   - Check console for errors via MCP browser tools

8. **Commit Changes:**
   ```bash
   git add .
   git commit -m "✨ feat: implement weight goal creation (US-2.1)"
   ```

### **4.2 Documentation Update Protocol**

**MANDATORY: Update documentation when changes occur to:**

#### **PRD.md Updates Required For:**
- **New User Stories:** When requirements change or new features are requested
- **Modified Acceptance Criteria:** When implementation reveals edge cases or refinements needed
- **API Changes:** When endpoints are added, modified, or removed
- **Database Schema Changes:** When new tables, columns, or constraints are added
- **Integration Requirements:** When third-party services or new dependencies are added
- **Performance Requirements:** When performance targets or benchmarks change
- **Security Requirements:** When new security measures or compliance needs are identified

**PRD Update Process:**
1. Read current PRD.md to understand existing specifications
2. Identify which sections need updates (user stories, acceptance criteria, API specs, etc.)
3. Update relevant sections with new/changed requirements
4. Increment version number in header
5. Update "Last Updated" date
6. Commit with: `📝 docs: update PRD with [specific changes] (vX.X)`

#### **DESIGN-SYSTEM.md Updates Required For:**
- **New Components:** When UI components are added or significantly modified
- **Token Changes:** When colors, typography, spacing, or other design tokens change
- **New Patterns:** When UI patterns or interaction behaviors are established
- **Responsive Breakpoints:** When breakpoint behavior changes
- **Accessibility Updates:** When new a11y patterns or requirements are implemented
- **Animation Changes:** When new animations or transitions are added
- **Theme Updates:** When dark/light mode or theme system changes

**Design System Update Process:**
1. Read current DESIGN-SYSTEM.md to understand existing patterns
2. Document new/changed components with full code examples
3. Update token values and references
4. Add new patterns to appropriate sections
5. Update component examples and usage guidelines
6. Increment version number in header
7. Update "Last Updated" date
8. Commit with: `📝 docs: update design system with [specific changes] (vX.X)`

### **4.3 Progress Tracking Protocol**

**MANDATORY: Review PRD progress after completing todos:**

#### **After Todo Completion:**
1. **Read PRD.md:** Review relevant user stories that were worked on
2. **Check Implementation Status:** 
   - Mark user stories as "In Progress" when work begins
   - Mark as "Completed" when all acceptance criteria are met
   - Mark as "Blocked" if dependencies prevent completion
3. **Update PRD Implementation Status:** Add implementation notes to user stories
4. **Document Learnings:** Add any discovered edge cases or refinements to acceptance criteria
5. **Plan Next Steps:** Identify next user stories or dependencies to work on

**PRD Progress Tracking Format:**
```markdown
## Implementation Status

**Epic 1: Authentication & User Management**
- [x] US-1.1: User Registration - ✅ Completed (2025-09-08)
- [🔄] US-1.2: User Login - 🔄 In Progress 
- [ ] US-1.3: Password Reset - ⏳ Pending
- [ ] US-1.4: Session Management - ⏳ Pending

**Epic 2: Weight Goals Management**  
- [ ] US-2.1: Create Weight Goal - ⏳ Pending
- [ ] US-2.2: Update Active Goal - ⏳ Pending
```

#### **Weekly Progress Review:**
1. **Read entire PRD.md** to understand overall project status
2. **Identify completed user stories** and ensure they're properly marked
3. **Review blocked items** and determine resolution path
4. **Update project timeline** if needed
5. **Plan upcoming sprint** based on dependencies and priorities
6. **Document any scope changes** that emerged during development

### **4.4 Code Review Checklist**

**Before Creating PR:**
- [ ] All tests passing (`npm run test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] TypeScript compilation clean (`npm run build`)
- [ ] Visual validation completed
- [ ] Screenshots attached to PR
- [ ] **Documentation updated** (PRD.md and/or DESIGN-SYSTEM.md if applicable)
- [ ] **Progress tracking updated** in PRD.md for completed user stories

**PR Description Template:**
```markdown
## 📋 Summary
Brief description of changes

## 🎯 User Story
US-X.X: [User story description]

## ✅ Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## 📸 Visual Evidence
### Desktop
![Desktop Screenshot](screenshot-desktop.png)

### Mobile  
![Mobile Screenshot](screenshot-mobile.png)

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Visual regression tests passing
- [ ] Manual testing completed

## 📝 Notes
Any additional context or considerations
```

## **5. Performance Guidelines**

### **5.1 Component Optimization**

```typescript
// ✅ Good: Memoized components
const WeightGraph = memo(({ data, timeRange }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.data.length === nextProps.data.length &&
         prevProps.timeRange === nextProps.timeRange
})

// ✅ Good: Lazy loading
const ConfettiEffect = lazy(() => import('./ConfettiEffect'))

// ✅ Good: Optimized re-renders
const [optimisticWeight, setOptimisticWeight] = useOptimistic(
  weight,
  (state, newWeight) => newWeight
)
```

### **5.2 Bundle Optimization**

```typescript
// ✅ Good: Tree shaking friendly imports
import { format } from 'date-fns'

// ❌ Bad: Imports entire library
import * as dateFns from 'date-fns'

// ✅ Good: Dynamic imports for heavy components
const ChartComponent = dynamic(
  () => import('./ChartComponent'),
  { loading: () => <ChartSkeleton /> }
)
```

## **6. Error Handling Standards**

### **6.1 Error Boundaries**

```typescript
// Wrap major sections with error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <WeightTrackingDashboard />
</ErrorBoundary>
```

### **6.2 User-Friendly Error Messages**

```typescript
// ✅ Good: Helpful error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to save your data. Please check your connection and try again.",
  VALIDATION_ERROR: "Please enter a valid weight between 30 and 300 kg.",
  SESSION_EXPIRED: "Your session has expired. Please log in again."
}

// ❌ Bad: Technical error messages
"Error 500: Internal server error"
```

## **7. Security Best Practices**

### **7.1 Input Validation**

```typescript
// ✅ Always validate and sanitize user input
const validateWeight = (weight: string): number => {
  const parsed = parseFloat(weight)
  if (isNaN(parsed) || parsed < 30 || parsed > 300) {
    throw new Error('Invalid weight value')
  }
  return parsed
}
```

### **7.2 Environment Variables**

```bash
# ✅ Required environment variables (no fallbacks)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# ❌ Never hardcode secrets
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hardcoded-url"
```

## **8. Documentation Standards**

### **8.1 Code Documentation**

```typescript
/**
 * Calculates daily weight loss required to meet goal by deadline
 * @param currentWeight - Current weight in kg
 * @param targetWeight - Target weight in kg  
 * @param daysRemaining - Days until deadline
 * @returns Daily weight loss required in kg
 * @throws Error when target is higher than current weight
 */
const calculateDailyWeightLoss = (
  currentWeight: number,
  targetWeight: number, 
  daysRemaining: number
): number => {
  // Implementation
}
```

### **8.2 README Updates**

Keep README.md updated with:
- Setup instructions
- Development commands
- Testing procedures
- Deployment steps
- Environment variables

## **9. Quality Gates**

### **9.1 Pre-Commit Checks**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:unit",
      "pre-push": "npm run test && npm run build"
    }
  }
}
```

### **9.2 CI/CD Pipeline**

Required checks before merge:
- [ ] All tests passing
- [ ] 100% E2E test coverage
- [ ] No ESLint/TypeScript errors
- [ ] Visual regression tests passing
- [ ] Performance budget met
- [ ] Security scan passed

## **10. Development Commands Reference**

### **10.1 Standard Development Commands**
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run format           # Prettier format
npm run typecheck        # TypeScript check
```

### **10.2 MCP Server Commands (REQUIRED)**

#### **Supabase Operations**
```typescript
// Project Management
mcp__supabase__list_projects()
mcp__supabase__get_project({ id: PROJECT_ID })
mcp__supabase__create_project({ name, region, organization_id })

// Database Operations
mcp__supabase__apply_migration({ project_id, name, query })
mcp__supabase__execute_sql({ project_id, query })
mcp__supabase__list_tables({ project_id })

// Configuration
mcp__supabase__get_project_url({ project_id })
mcp__supabase__get_anon_key({ project_id })

// Debugging
mcp__supabase__get_logs({ project_id, service: 'api' })
mcp__supabase__get_advisors({ project_id, type: 'security' })
```

#### **shadcn/ui Component Operations**
```typescript
// Component Discovery
mcp__shadcn__search_items_in_registries({ registries: ['@shadcn'], query: 'button' })
mcp__shadcn__list_items_in_registries({ registries: ['@shadcn'] })

// Component Installation
mcp__shadcn__get_add_command_for_items({ items: ['@shadcn/button', '@shadcn/input'] })
mcp__shadcn__view_items_in_registries({ items: ['@shadcn/button'] })

// Examples & Documentation
mcp__shadcn__get_item_examples_from_registries({ registries: ['@shadcn'], query: 'button-demo' })
```

#### **Playwright Testing Operations**
```typescript
// Browser Control
mcp__playwright__browser_navigate({ url: 'http://localhost:3000' })
mcp__playwright__browser_snapshot()
mcp__playwright__browser_take_screenshot({ fullPage: true })

// User Interactions
mcp__playwright__browser_click({ element: 'Submit button', ref: 'button[type="submit"]' })
mcp__playwright__browser_type({ element: 'Weight input', ref: '#weight', text: '75.5' })
mcp__playwright__browser_fill_form({ fields: [...] })

// Testing & Validation
mcp__playwright__browser_console_messages()
mcp__playwright__browser_network_requests()
mcp__playwright__browser_wait_for({ text: 'Weight saved successfully' })
```

#### **Vercel Deployment Operations**
```typescript
// Deployment Management
mcp__vercel__deploy_to_vercel()
mcp__vercel__list_projects({ teamId })
mcp__vercel__get_deployment({ idOrUrl, teamId })

// Debugging Deployments
mcp__vercel__get_deployment_build_logs({ idOrUrl, teamId, limit: 100 })
mcp__vercel__list_deployments({ projectId, teamId })
```

### **10.3 Prohibited Direct Commands**
```bash
# ❌ NEVER use these direct commands - use MCP servers instead

# Database operations (use Supabase MCP)
supabase db push
supabase gen types

# Component installation (use shadcn MCP)
npx shadcn add button input
npx shadcn@latest init

# Testing (use Playwright MCP)
npx playwright test
npx playwright codegen

# Deployment (use Vercel MCP)
vercel deploy
vercel build
```

Remember: **Quality is not negotiable.** Every piece of code should meet these standards before being merged to main.