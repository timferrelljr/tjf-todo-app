# TJF ToDo App

A professional, production-ready todo application built with modern React practices. This is a complete rebuild of an existing Bolt.new prototype, designed for scalability and potential SaaS monetization.

## Features

- 🎯 **Dynamic Task Management** - Create, edit, delete tasks with comprehensive metadata
- 📁 **Category System** - Organize tasks with custom categories and colors
- 🎨 **Drag & Drop** - Intuitive task reordering within categories  
- 📊 **Master View** - Overview of all tasks across categories
- 🔐 **Authentication** - Secure user authentication via Supabase
- 💾 **Data Persistence** - PostgreSQL database with Row Level Security
- 📱 **Responsive Design** - Professional UI with zen-inspired emerald theme
- ⚡ **Real-time Updates** - Optimistic UI updates for better UX

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **@dnd-kit** for drag & drop functionality
- **Lucide React** for icons

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)

### Development Tools
- **ESLint** & **Prettier** for code quality
- **Vitest** & **React Testing Library** for testing
- **Husky** for git hooks

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd tjf-todo
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials to `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase database**
   
   Run these SQL commands in your Supabase SQL editor:
   
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create categories table
   CREATE TABLE categories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     color TEXT NOT NULL DEFAULT '#10b981',
     position INTEGER NOT NULL DEFAULT 0,
     user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create tasks table
   CREATE TABLE tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     notes TEXT,
     category_id UUID REFERENCES categories ON DELETE CASCADE NOT NULL,
     priority TEXT NOT NULL DEFAULT 'Standard' CHECK (priority IN ('Standard', 'Important', 'Urgent')),
     status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Waiting for...', 'Complete')),
     due_date DATE,
     position INTEGER NOT NULL DEFAULT 0,
     user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     completed_at TIMESTAMP WITH TIME ZONE
   );

   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card)
│   ├── task/           # Task-related components
│   └── category/       # Category-related components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── supabase.ts     # Supabase client setup
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Helper functions
├── stores/             # State management (React Context)
├── views/              # Page-level components
└── test/               # Test setup and utilities
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting service
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Architecture Decisions

- **React Context** for state management (simple, built-in)
- **Custom hooks** for data fetching and business logic
- **TypeScript** throughout for type safety
- **Tailwind CSS** for consistent, utility-first styling
- **Supabase** for backend-as-a-service simplicity

## License

This project is licensed under the MIT License.# Force deployment
