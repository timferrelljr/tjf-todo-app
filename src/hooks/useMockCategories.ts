import { useState, useCallback } from 'react';
import { useApp } from '../stores/AppContext';
import type { Category } from '../lib/types';
import { 
  getMockCategories, 
  setMockCategories, 
  generateId,
  MOCK_USER_ID 
} from '../lib/mockData';

interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export function useMockCategories() {
  const { categories, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    console.log('Mock: Fetching categories');
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const mockCategories = getMockCategories();
      console.log('Mock: Fetched categories:', mockCategories);
      dispatch({ type: 'SET_CATEGORIES', payload: mockCategories });
    } catch (error) {
      console.error('Mock: Error fetching categories:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch categories' 
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createCategory = useCallback(async (categoryData: CreateCategoryData) => {
    console.log('Mock: Creating category with data:', categoryData);
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentCategories = getMockCategories();
      const nextPosition = Math.max(...currentCategories.map(c => c.position), 0) + 1;
      
      const newCategory: Category = {
        id: generateId(),
        ...categoryData,
        position: nextPosition,
        user_id: MOCK_USER_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Mock: Created new category:', newCategory);

      const updatedCategories = [...currentCategories, newCategory];
      setMockCategories(updatedCategories);
      
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      return { data: newCategory, error: null };
    } catch (error) {
      console.error('Mock: Error creating category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateCategory = useCallback(async (categoryData: UpdateCategoryData) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentCategories = getMockCategories();
      const categoryIndex = currentCategories.findIndex(c => c.id === categoryData.id);
      
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }

      const updatedCategory = {
        ...currentCategories[categoryIndex],
        ...categoryData,
        updated_at: new Date().toISOString(),
      };

      const updatedCategories = [...currentCategories];
      updatedCategories[categoryIndex] = updatedCategory;
      setMockCategories(updatedCategories);

      dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
      return { data: updatedCategory, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    console.log('Mock: Deleting category:', categoryId);
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay - reduced for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Delete the category
      const currentCategories = getMockCategories();
      const filteredCategories = currentCategories.filter(c => c.id !== categoryId);
      setMockCategories(filteredCategories);

      // Also delete all tasks in this category
      const { getMockTasks, setMockTasks } = await import('../lib/mockData');
      const currentTasks = getMockTasks();
      const filteredTasks = currentTasks.filter(t => t.category_id !== categoryId);
      setMockTasks(filteredTasks);

      console.log('Mock: Category and associated tasks deleted');

      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      // Update tasks in store to reflect the deletion
      dispatch({ type: 'SET_TASKS', payload: filteredTasks });
      return { error: null };
    } catch (error) {
      console.error('Mock: Error deleting category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const reorderCategories = useCallback(async (reorderedCategories: Category[]) => {
    console.log('Mock: Reordering categories:', reorderedCategories);
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay
      
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      console.log('Mock: Saving reordered categories to localStorage:', updatedCategories);
      setMockCategories(updatedCategories);
      dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
      console.log('Mock: Categories reordered successfully');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder categories';
      console.error('Mock: Reorder categories error:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Removed auto-fetch to prevent loops - Dashboard will call fetchCategories explicitly

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}