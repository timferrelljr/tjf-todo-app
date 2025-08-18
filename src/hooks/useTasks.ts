import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../stores/AppContext';
import { isMockMode } from '../lib/config';
import { useMockTasks } from './useMockTasks';

// Define types locally to avoid import issues
type TaskPriority = 'Standard' | 'Important' | 'Urgent';
type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting for...' | 'Complete';

interface Task {
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

interface CreateTaskData {
  name: string;
  notes?: string;
  category_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
}

interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

export function useTasks() {
  const mockHook = useMockTasks();
  
  // Return mock hook if in mock mode
  if (isMockMode()) {
    return mockHook;
  }

  // Original real implementation
  const { tasks, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      dispatch({ type: 'SET_TASKS', payload: data || [] });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch tasks' 
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createTask = useCallback(async (taskData: CreateTaskData) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Get max position for the category
      const { data: maxPositionData } = await supabase
        .from('tasks')
        .select('position')
        .eq('category_id', taskData.category_id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (maxPositionData?.[0]?.position || 0) + 1;

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, position: nextPosition }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_TASK', payload: data });
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateTask = useCallback(async (taskData: UpdateTaskData) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updateData = {
        ...taskData,
        updated_at: new Date().toISOString(),
        ...(taskData.status === 'Complete' && { completed_at: new Date().toISOString() }),
        ...(taskData.status !== 'Complete' && { completed_at: null }),
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskData.id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_TASK', payload: data });
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteTask = useCallback(async (taskId: string) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const reorderTasks = useCallback(async (categoryId: string, reorderedTasks: Task[]) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Update positions in database
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('tasks')
        .upsert(updates);

      if (error) throw error;

      // Update local state
      const updatedTasks = reorderedTasks.map((task, index) => ({
        ...task,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      dispatch({ 
        type: 'REORDER_TASKS', 
        payload: { categoryId, tasks: updatedTasks } 
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const getTasksByCategory = useCallback((categoryId: string) => {
    return tasks.filter(task => task.category_id === categoryId);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    getTasksByCategory,
    getTasksByStatus,
  };
}