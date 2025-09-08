# **Claude Code Development Guidelines**

## **Project Overview**

**Project:** Weight Tracker - A modern weight tracking application  
**Framework:** Next.js 15 with TypeScript, shadcn/ui, Tailwind CSS  
**Backend:** Supabase (PostgreSQL)  
**Testing:** Playwright (E2E + Visual), Jest (Unit)

## **1. Development Standards**

### **1.1 Code Quality Requirements**

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

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/US-X.X-feature-name
   ```

2. **Review Requirements:**
   - Read user story in PRD.md
   - Check acceptance criteria
   - Review design specifications in DESIGN-SYSTEM.md

3. **Implement with TDD:**
   ```bash
   # Write failing test first
   npm run test:watch
   
   # Implement feature
   # Make test pass
   
   # Refactor if needed
   ```

4. **Visual Validation:**
   - Follow mandatory visual check protocol
   - Take screenshots at all breakpoints
   - Check console for errors

5. **Commit Changes:**
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

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Testing
npm run test             # All tests
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests only
npm run test:visual      # Visual regression tests
npm run test:watch       # Watch mode for unit tests

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run format           # Prettier format
npm run typecheck        # TypeScript check

# Visual Validation
npm run visual:check     # Run visual validation
npm run visual:update    # Update visual baselines
```

Remember: **Quality is not negotiable.** Every piece of code should meet these standards before being merged to main.