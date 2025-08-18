# Mock Mode Setup

This todo app now includes a mock mode that allows you to test the full UI without setting up Supabase authentication and database.

## How Mock Mode Works

Mock mode is currently **enabled by default** for easy testing. The app will:

- ✅ Skip authentication (any email/password will work)
- ✅ Use sample categories and tasks stored in localStorage
- ✅ Simulate all CRUD operations with realistic delays
- ✅ Show demo mode indicators in the UI

## Sample Data Included

The mock mode comes pre-populated with:

**Categories:**
- 💼 Work (3 tasks)
- 🏠 Personal (2 tasks)  
- 💪 Health & Fitness (2 tasks)
- 📚 Learning (2 tasks)
- 🎨 Creative Projects (1 task)

**Features You Can Test:**
- ✅ Create, edit, delete categories
- ✅ Customize category colors and icons
- ✅ Drag and drop category reordering
- ✅ Add tasks with quick input or detailed form
- ✅ Task priority and status management
- ✅ All three navigation views (Tasks, Master View, Categories)

## Toggling Mock Mode

To disable mock mode and use real Supabase:

1. Open `src/lib/config.ts`
2. Change `FORCE_MOCK_MODE = true` to `FORCE_MOCK_MODE = false`
3. Set up your Supabase environment variables

## Testing the UI

1. Start the dev server: `npm run dev`
2. Navigate to the app (http://localhost:5173 or 5174)
3. On the login screen, enter any email/password (e.g., "demo@test.com" / "password")
4. Explore all the features with the pre-loaded sample data

## Data Persistence

In mock mode:
- All data is stored in browser localStorage
- Data persists between browser sessions
- Clear browser storage to reset to sample data
- No actual database connections are made

## Production Note

Remember to disable mock mode before deploying to production by setting `FORCE_MOCK_MODE = false` and providing real Supabase credentials.