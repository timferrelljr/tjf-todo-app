import { useState, useCallback } from 'react';
import { useApp } from '../stores/AppContext';
import type { Task, TaskPriority, TaskStatus } from '../lib/types';
import { 
  getMockTasks, 
  setMockTasks, 
  generateId,
  MOCK_USER_ID 
} from '../lib/mockData';

interface CreateTaskData {
  name: string;
  notes?: string;
  category_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
}

interface UpdateTaskData {
  id: string;
  name?: string;
  notes?: string;
  category_id?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  position?: number;
}

export function useMockTasks() {
  const { tasks, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const mockTasks = getMockTasks();
      dispatch({ type: 'SET_TASKS', payload: mockTasks });
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
    console.log('Mock: Creating task with data:', taskData);
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentTasks = getMockTasks();
      const categoryTasks = currentTasks.filter(t => t.category_id === taskData.category_id);
      const nextPosition = Math.max(...categoryTasks.map(t => t.position), 0) + 1;
      
      const newTask: Task = {
        id: generateId(),
        ...taskData,
        position: nextPosition,
        user_id: MOCK_USER_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(taskData.status === 'Complete' && { completed_at: new Date().toISOString() }),
      };

      console.log('Mock: Created new task:', newTask);

      const updatedTasks = [...currentTasks, newTask];
      setMockTasks(updatedTasks);
      
      dispatch({ type: 'ADD_TASK', payload: newTask });
      return { data: newTask, error: null };
    } catch (error) {
      console.error('Mock: Error creating task:', error);
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
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentTasks = getMockTasks();
      const taskIndex = currentTasks.findIndex(t => t.id === taskData.id);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updateData = {
        ...taskData,
        updated_at: new Date().toISOString(),
        ...(taskData.status === 'Complete' && { completed_at: new Date().toISOString() }),
        ...(taskData.status !== 'Complete' && { completed_at: undefined }),
      };

      const updatedTask = {
        ...currentTasks[taskIndex],
        ...updateData,
      };

      const updatedTasks = [...currentTasks];
      updatedTasks[taskIndex] = updatedTask;
      setMockTasks(updatedTasks);

      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      return { data: updatedTask, error: null };
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
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentTasks = getMockTasks();
      const filteredTasks = currentTasks.filter(t => t.id !== taskId);
      setMockTasks(filteredTasks);

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay
      
      const currentTasks = getMockTasks();
      // Filter out ALL tasks that are being reordered by their IDs
      const reorderedTaskIds = reorderedTasks.map(t => t.id);
      const otherTasks = currentTasks.filter(t => !reorderedTaskIds.includes(t.id));
      
      // Ensure all reordered tasks have the correct category_id
      const correctedReorderedTasks = reorderedTasks.map(task => ({
        ...task,
        category_id: categoryId  // Force correct category
      }));
      
      const updatedReorderedTasks = correctedReorderedTasks.map((task, index) => ({
        ...task,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      const allUpdatedTasks = [...otherTasks, ...updatedReorderedTasks];
      setMockTasks(allUpdatedTasks);

      dispatch({ 
        type: 'SET_TASKS', 
        payload: allUpdatedTasks 
      });
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder tasks';
      console.error('Mock: Reorder error:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const getTasksByCategory = useCallback((categoryId: string) => {
    return tasks
      .filter(task => task.category_id === categoryId)
      .sort((a, b) => a.position - b.position);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Removed auto-fetch to prevent loops - Dashboard will call fetchTasks explicitly

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