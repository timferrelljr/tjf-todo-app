// Core domain types for the TJF Todo application

export type TaskPriority = 'Standard' | 'Important' | 'Urgent';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting for...' | 'Complete';
export type SubscriptionStatus = 'free' | 'premium_monthly' | 'premium_lifetime';

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
  description?: string;
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

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

// UI State types are now defined in stores/AppContext.tsx

// Form types
export interface CreateTaskData {
  name: string;
  notes?: string;
  description?: string;
  category_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
  position?: number;
}

export interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}