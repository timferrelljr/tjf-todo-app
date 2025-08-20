import type { Category, Task } from './types';

// Mock user ID for testing
export const MOCK_USER_ID = 'mock-user-123';

// Mock categories with various colors and icons
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Work',
    color: '#3B82F6',
    icon: 'Briefcase',
    position: 1,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Personal',
    color: '#10B981',
    icon: 'Home',
    position: 2,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Health & Fitness',
    color: '#EF4444',
    icon: 'Heart',
    position: 3,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Learning',
    color: '#8B5CF6',
    icon: 'BookOpen',
    position: 4,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Creative Projects',
    color: '#F59E0B',
    icon: 'Palette',
    position: 5,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
];

// Mock tasks with various priorities and statuses
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Review quarterly reports',
    notes: 'Focus on Q3 performance metrics',
    category_id: 'cat-1',
    priority: 'Important',
    status: 'In Progress',
    due_date: '2024-12-15',
    position: 1,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-2',
    name: 'Prepare presentation for Monday meeting',
    category_id: 'cat-1',
    priority: 'Urgent',
    status: 'Not Started',
    due_date: '2024-12-16',
    position: 2,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-3',
    name: 'Update LinkedIn profile',
    notes: 'Add recent projects and skills',
    category_id: 'cat-1',
    priority: 'Standard',
    status: 'Waiting for...',
    position: 3,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-4',
    name: 'Grocery shopping',
    notes: 'Milk, bread, fruits, vegetables',
    category_id: 'cat-2',
    priority: 'Standard',
    status: 'Not Started',
    position: 1,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-5',
    name: 'Call mom',
    category_id: 'cat-2',
    priority: 'Important',
    status: 'Complete',
    completed_at: '2024-01-02T15:30:00Z',
    position: 2,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-02T15:30:00Z',
  },
  {
    id: 'task-6',
    name: 'Morning run - 5km',
    category_id: 'cat-3',
    priority: 'Standard',
    status: 'Complete',
    completed_at: '2024-01-02T07:00:00Z',
    position: 1,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-02T07:00:00Z',
  },
  {
    id: 'task-7',
    name: 'Yoga session',
    notes: '30 minutes morning routine',
    category_id: 'cat-3',
    priority: 'Standard',
    status: 'In Progress',
    position: 2,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-8',
    name: 'Read "Atomic Habits" chapter 5',
    category_id: 'cat-4',
    priority: 'Standard',
    status: 'Not Started',
    position: 1,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-9',
    name: 'Complete TypeScript course module',
    notes: 'Focus on advanced types and generics',
    category_id: 'cat-4',
    priority: 'Important',
    status: 'In Progress',
    due_date: '2024-12-20',
    position: 2,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-10',
    name: 'Design new logo concepts',
    notes: 'Try 3 different approaches',
    category_id: 'cat-5',
    priority: 'Standard',
    status: 'Not Started',
    due_date: '2024-12-18',
    position: 1,
    user_id: MOCK_USER_ID,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
];

// Local storage keys
export const MOCK_STORAGE_KEYS = {
  categories: 'tjf-todo-mock-categories',
  tasks: 'tjf-todo-mock-tasks',
} as const;

// Helper functions for mock data
export const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const initializeMockData = () => {
  console.log('Initializing mock data...');
  
  // Initialize categories if not present (don't overwrite existing ones)
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.categories)) {
    console.log('No categories in localStorage, initializing with mock data');
    localStorage.setItem(MOCK_STORAGE_KEYS.categories, JSON.stringify(mockCategories));
  } else {
    console.log('Categories already exist in localStorage, keeping user customizations');
  }
  
  // Initialize tasks if not present
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.tasks)) {
    console.log('No tasks in localStorage, initializing with mock data');
    localStorage.setItem(MOCK_STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
  } else {
    console.log('Tasks already exist in localStorage');
  }

  console.log('Mock data initialization complete');
};

export const getMockCategories = (): Category[] => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEYS.categories);
  const result = stored ? JSON.parse(stored) : mockCategories;
  console.log('getMockCategories returning:', result);
  return result;
};

export const getMockTasks = (): Task[] => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEYS.tasks);
  const result = stored ? JSON.parse(stored) : mockTasks;
  console.log('getMockTasks returning:', result);
  return result;
};

export const setMockCategories = (categories: Category[]) => {
  console.log('setMockCategories saving:', categories);
  localStorage.setItem(MOCK_STORAGE_KEYS.categories, JSON.stringify(categories));
  console.log('Categories saved to localStorage');
};

export const setMockTasks = (tasks: Task[]) => {
  console.log('setMockTasks saving:', tasks);
  localStorage.setItem(MOCK_STORAGE_KEYS.tasks, JSON.stringify(tasks));
  console.log('Tasks saved to localStorage');
};

export const clearMockData = () => {
  localStorage.removeItem(MOCK_STORAGE_KEYS.categories);
  localStorage.removeItem(MOCK_STORAGE_KEYS.tasks);
  console.log('Mock data cleared from localStorage');
};

export const resetMockData = () => {
  clearMockData();
  // Force fresh initialization
  console.log('Forcing fresh mock data initialization...');
  localStorage.setItem(MOCK_STORAGE_KEYS.categories, JSON.stringify(mockCategories));
  localStorage.setItem(MOCK_STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
  console.log('Mock data reset complete');
};