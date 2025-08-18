import { createContext, useContext, useReducer, type ReactNode } from 'react';

// Define core types locally to avoid import issues
export type TaskPriority = 'Standard' | 'Important' | 'Urgent';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting for...' | 'Complete';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  notes?: string;
  category_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Define AppState interface locally to avoid import issues
interface AppState {
  currentView: 'tasks' | 'master' | 'categories' | 'completed';
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType {
  state: AppState;
  categories: Category[];
  tasks: Task[];
  dispatch: React.Dispatch<AppAction>;
}

type AppAction = 
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { categoryId: string; tasks: Task[] } };

const initialState: AppState = {
  currentView: 'tasks',
  selectedCategoryId: null,
  isLoading: false,
  error: null,
};

function appReducer(
  state: AppState,
  action: AppAction
): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategoryId: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function dataReducer(
  data: { categories: Category[]; tasks: Task[] },
  action: AppAction
): { categories: Category[]; tasks: Task[] } {
  console.log('DataReducer action:', action.type, action.payload);
  switch (action.type) {
    case 'SET_CATEGORIES':
      console.log('Setting categories:', action.payload);
      return { ...data, categories: action.payload };
    case 'SET_TASKS':
      return { ...data, tasks: action.payload };
    case 'ADD_CATEGORY':
      console.log('Adding category:', action.payload);
      const newCategories = [...data.categories, action.payload].sort((a, b) => a.position - b.position);
      console.log('New categories array:', newCategories);
      return { 
        ...data, 
        categories: newCategories
      };
    case 'UPDATE_CATEGORY':
      return {
        ...data,
        categories: data.categories.map(cat => 
          cat.id === action.payload.id ? action.payload : cat
        ).sort((a, b) => a.position - b.position)
      };
    case 'DELETE_CATEGORY':
      return {
        ...data,
        categories: data.categories.filter(cat => cat.id !== action.payload),
        tasks: data.tasks.filter(task => task.category_id !== action.payload)
      };
    case 'ADD_TASK':
      return {
        ...data,
        tasks: [...data.tasks, action.payload].sort((a, b) => a.position - b.position)
      };
    case 'UPDATE_TASK':
      return {
        ...data,
        tasks: data.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ).sort((a, b) => a.position - b.position)
      };
    case 'DELETE_TASK':
      return {
        ...data,
        tasks: data.tasks.filter(task => task.id !== action.payload)
      };
    case 'REORDER_TASKS':
      return {
        ...data,
        tasks: data.tasks.map(task => {
          if (task.category_id === action.payload.categoryId) {
            const reorderedTask = action.payload.tasks.find(t => t.id === task.id);
            return reorderedTask || task;
          }
          return task;
        })
      };
    default:
      return data;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, stateDispatch] = useReducer(appReducer, initialState);
  const [data, dataDispatch] = useReducer(dataReducer, { categories: [], tasks: [] });

  const dispatch = (action: AppAction) => {
    stateDispatch(action);
    dataDispatch(action);
  };

  return (
    <AppContext.Provider 
      value={{ 
        state, 
        categories: data.categories, 
        tasks: data.tasks, 
        dispatch 
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export type { AppAction, AppState };