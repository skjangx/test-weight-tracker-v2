# **Weight Tracker 🏋️‍♀️**

> **Track progress, reach your goals**

A modern, focused weight tracking application built with Next.js, Supabase, and shadcn/ui components.

## **🚀 Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/skjangx/weight-tracker-v2.git
   cd weight-tracker-v2
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## **📋 Project Overview**

### **Core Features**
- **Goal-Driven Tracking:** Set weight goals with deadlines and track daily/weekly/monthly progress
- **Visual Analytics:** Interactive graphs with moving averages and trend analysis  
- **Smart Data Entry:** Quick weight logging with memo support and validation
- **Cross-Device Sync:** Real-time data synchronization across all devices
- **Progress Celebrations:** Milestone achievements and streak tracking

### **Technical Stack**
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui with custom design system
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **State Management:** React Query with optimistic updates
- **Testing:** Playwright (E2E), Jest (Unit), Visual Regression
- **Deployment:** Vercel (Frontend), Supabase Cloud (Backend)

## **🛠️ Development**

### **Available Commands**
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build  
npm run start            # Start production server

# Testing
npm run test             # All tests
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests
npm run test:visual      # Visual regression tests

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run format           # Prettier format
npm run typecheck        # TypeScript check
```

### **Project Structure**
```
├── app/                 # Next.js app directory
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── tests/              # Test files
└── docs/               # Documentation
    ├── PRD.md          # Product Requirements
    ├── DESIGN-SYSTEM.md # Design System Guide
    └── CLAUDE.md        # Development Guidelines
```

## **📖 Documentation**

- **[PRD.md](./PRD.md)** - Complete product requirements with indexed user stories
- **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** - Design tokens, components, and patterns  
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and best practices

## **🎯 User Stories & Progress**

This project implements 47 user stories across 8 epics:

1. **Authentication & User Management** (4 stories)
2. **Weight Goals Management** (5 stories)  
3. **Weight Data Entry** (4 stories)
4. **Data Visualization** (6 stories)
5. **Data Table** (4 stories)
6. **Sync & Real-time Updates** (3 stories)
7. **Progress Tracking** (3 stories)
8. **User Experience** (6 stories)

**Current Progress:** See [Implementation Status](#implementation-status) section in PRD.md

## **🔐 Environment Variables**

Required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## **🧪 Testing Strategy**

- **100% E2E Test Coverage:** Every user story has corresponding E2E tests
- **Unit Testing:** Business logic and component testing with Jest
- **Visual Regression:** Screenshot-based UI testing with Playwright
- **Cross-Browser:** Chrome, Firefox, Safari testing
- **Mobile Testing:** Responsive behavior at all breakpoints

## **🚀 Deployment**

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### **Manual Deployment**  
```bash
npm run build
npm run start
```

## **🤝 Contributing**

1. **Follow development guidelines** in [CLAUDE.md](./CLAUDE.md)
2. **Use gitmoji commits:** `✨ feat: add weight goal creation`
3. **Include visual validation** for all UI changes
4. **Ensure 100% test coverage** for new features
5. **Update documentation** when requirements change

### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/US-X.X-feature-name

# Make changes following CLAUDE.md guidelines
# Include tests and visual validation

# Commit with gitmoji
git commit -m "✨ feat: implement feature (US-X.X)"

# Push and create PR
git push origin feature/US-X.X-feature-name
```

## **📊 Quality Standards**

- **Performance:** < 2 second page loads, Lighthouse score > 90
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Security:** No hardcoded secrets, input validation, HTTPS only
- **Code Quality:** TypeScript strict mode, ESLint clean, 100% test coverage

## **🐛 Issues & Support**

- **Bug Reports:** [GitHub Issues](https://github.com/skjangx/weight-tracker-v2/issues)
- **Development Questions:** Check [CLAUDE.md](./CLAUDE.md) first
- **Design Questions:** Reference [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)

## **📄 License**

This project is built for personal use. See implementation for commercial licensing considerations.

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**