# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TJF ToDo App** - A professional, production-ready todo application built with modern React practices. This is a complete rebuild of an existing Bolt.new prototype, designed for scalability and potential SaaS monetization.

### Key Features
- Dynamic task management with categories, priorities, and status tracking
- Drag & drop task reordering
- Real-time category management with custom colors
- Master view across all categories
- User authentication and data persistence
- Professional UI with zen-inspired design

## Development Commands

### Core Commands
- **Install dependencies**: `npm install`
- **Development server**: `npm run dev` (starts on http://localhost:5173)
- **Build production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview build**: `npm run preview`

### Additional Commands (to be added)
- **Type checking**: `npm run typecheck`
- **Run tests**: `npm run test`
- **Run tests (watch)**: `npm run test:watch`
- **Format code**: `npm run format`

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **@dnd-kit** for drag & drop functionality
- **Lucide React** for icons

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** via Supabase with Row Level Security

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **TypeScript** throughout

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── task/           # Task-related components
│   └── category/       # Category-related components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── supabase.ts     # Supabase client setup
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Helper functions
├── stores/             # State management
└── views/              # Page-level components
```

## Architecture Patterns

### State Management
- **React Context** for global app state
- **Custom hooks** for component-level state logic
- **Optimistic updates** for better UX

### Component Architecture
- **Compound components** for complex UI patterns
- **Render props** for flexible component composition
- **Error boundaries** for graceful error handling

## Database Schema (Supabase)

### Tables
- `profiles` - User profile information
- `categories` - User-defined task categories
- `tasks` - Individual tasks with full metadata
- `task_history` - Audit trail for task changes

### Key Relationships
- Users have many categories and tasks
- Categories have many tasks
- All data protected by Row Level Security (RLS)

## Development Workflow

### Before Starting Development
1. Ensure npm permissions are fixed: `sudo chown -R $(whoami) ~/.npm`
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Start development server: `npm run dev`

### Code Quality Standards
- All components must be TypeScript with proper typing
- Follow existing component patterns and folder structure
- Use custom hooks for reusable logic
- Implement proper error handling and loading states
- Write unit tests for utilities and complex components

### Git Workflow
- Feature branches: `feature/task-description`
- Commit messages: Follow conventional commits format
- Pre-commit hooks run linting and type checking

## Environment Variables

Required environment variables (see `.env.example`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Deployment

### Vercel Deployment
- Connected to GitHub for automatic deployments
- Environment variables configured in Vercel dashboard
- Preview deployments for all pull requests

## Notes for Development

### Known Issues
- npm permission issues may require: `sudo chown -R $(whoami) ~/.npm`
- Always run `npm run lint` before committing
- TypeScript strict mode is enabled - handle all type errors

### Performance Considerations
- Use React.memo for expensive components
- Implement virtualization for large task lists
- Optimize Supabase queries with proper indexing
- Consider code splitting for production builds