import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../stores/AppContext';
import { isMockMode } from '../lib/config';
import { useMockCategories } from './useMockCategories';

// Define types locally to avoid import issues
interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export function useCategories() {
  const mockHook = useMockCategories();
  
  // Return mock hook if in mock mode
  if (isMockMode()) {
    return mockHook;
  }

  // Original real implementation
  const { categories, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  // TEMPORARY: One-time cleanup function to remove default categories
  const cleanupDefaultCategories = useCallback(async () => {
    console.log('🧹 Cleaning up default Work/Home categories from database...');
    try {
      // Get current user for authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User not authenticated for cleanup:', userError);
        return;
      }

      console.log('👤 Current user ID:', user.id);

      // First, let's see what categories we're trying to delete
      const { data: defaultCats, error: selectError } = await supabase
        .from('categories')
        .select('*')
        .in('name', ['Work', 'Personal', 'Home']);
      
      console.log('🔍 Found these default categories to delete:', defaultCats);
      
      if (selectError) {
        console.error('❌ Failed to query default categories:', selectError);
        return;
      }

      if (!defaultCats || defaultCats.length === 0) {
        console.log('ℹ️ No default categories found to delete');
        return;
      }

      // Delete each category individually with proper user authentication
      for (const cat of defaultCats) {
        console.log(`🗑️ Deleting category: ${cat.name} (ID: ${cat.id}, user: ${cat.user_id})`);
        console.log(`👤 Current user: ${user.id}, Category user: ${cat.user_id}`);
        
        if (cat.user_id !== user.id) {
          console.log(`🔧 User ID mismatch! Updating category ownership first...`);
          
          // First, update the user_id to match current user
          const { error: updateError } = await supabase
            .from('categories')
            .update({ user_id: user.id })
            .eq('id', cat.id);
          
          if (updateError) {
            console.error(`❌ Failed to update ownership for ${cat.name}:`, updateError);
            continue;
          }
          
          console.log(`✅ Updated ownership for ${cat.name} to current user`);
        }
        
        // First delete all tasks in this category
        const { error: tasksError } = await supabase
          .from('tasks')
          .delete()
          .eq('category_id', cat.id)
          .eq('user_id', user.id);

        if (tasksError) {
          console.error(`❌ Failed to delete tasks for category ${cat.name}:`, tasksError);
          continue;
        }

        // Then delete the category
        const { data: deleteResult, error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', cat.id)
          .eq('user_id', user.id);
        
        console.log(`🗑️ Delete result for ${cat.name}:`, deleteResult);
        
        if (deleteError) {
          console.error(`❌ Failed to delete category ${cat.name}:`, deleteError);
        } else {
          console.log(`✅ Category ${cat.name} deleted successfully`);
        }
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    console.log('🔍 fetchCategories called in production mode');
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('position', { ascending: true });
      
      console.log('📊 Categories fetched from database:', data);
      
      // TEMPORARY: Check if we need to cleanup default categories
      const hasDefaultCategories = data?.some(cat => ['Work', 'Personal', 'Home'].includes(cat.name));
      if (hasDefaultCategories) {
        console.log('🚨 Found default categories, triggering cleanup...');
        await cleanupDefaultCategories();
        // Refetch after cleanup
        const { data: cleanData, error: cleanError } = await supabase
          .from('categories')
          .select('*')
          .order('position', { ascending: true });
        
        if (cleanError) throw cleanError;
        console.log('📊 Categories after cleanup:', cleanData);
        dispatch({ type: 'SET_CATEGORIES', payload: cleanData || [] });
        return { error: null };
      }

      if (error) throw error;
      dispatch({ type: 'SET_CATEGORIES', payload: data || [] });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch categories' 
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createCategory = useCallback(async (categoryData: CreateCategoryData) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get max position
      const { data: maxPositionData } = await supabase
        .from('categories')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (maxPositionData?.[0]?.position || 0) + 1;

      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          ...categoryData, 
          position: nextPosition,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_CATEGORY', payload: data });
      return { data, error: null };
    } catch (error) {
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
      const { data, error } = await supabase
        .from('categories')
        .update({ ...categoryData, updated_at: new Date().toISOString() })
        .eq('id', categoryData.id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_CATEGORY', payload: data });
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    console.log('🗑️ Attempting to delete category:', categoryId);
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Delete all tasks in this category first
      console.log('🗑️ Deleting tasks in category:', categoryId);
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('category_id', categoryId);

      if (tasksError) throw tasksError;

      // Then delete the category
      console.log('🗑️ Deleting category from database:', categoryId);
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (categoryError) throw categoryError;

      console.log('✅ Category deleted successfully:', categoryId);
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      
      // Also update tasks in the store to reflect deletions
      const { data: remainingTasks } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true });
      
      dispatch({ type: 'SET_TASKS', payload: remainingTasks || [] });
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const reorderCategories = useCallback(async (reorderedCategories: Category[]) => {
    setLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Update positions in database
      const updates = reorderedCategories.map((category, index) => ({
        id: category.id,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('categories')
        .upsert(updates);

      if (error) throw error;

      // Update local state
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder categories';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

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