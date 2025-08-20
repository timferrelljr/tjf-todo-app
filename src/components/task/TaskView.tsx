import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useTasks } from '../../hooks/useTasks';
import { useApp } from '../../stores/AppContext';
import { supabase } from '../../lib/supabase';
import { DraggableCategoryGrid } from '../category/DraggableCategoryGrid';
import { CategoryTasksView } from '../category/CategoryTasksView';
import { AddTaskInput } from './AddTaskInput';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { type Category } from '../../lib/types';
import { Button } from '../ui/Button';

interface TaskViewProps {
  theme?: 'light' | 'dark';
}

export function TaskView({ theme = 'light' }: TaskViewProps) {
  const { categories } = useCategories();
  const { tasks, fetchTasks } = useTasks();
  const { dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<any>(null); // TODO: Fix TypeScript issue
  const [showDetailedForm, setShowDetailedForm] = useState<boolean>(false);
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleTaskCreated = () => {
    // Close detailed form after task creation (but keep quick add visible)
    setShowDetailedForm(false);
  };

  const handleBackToGrid = () => {
    setSelectedCategory(null);
    setShowAllTasks(false);
  };

  const handleViewAllTasks = () => {
    setShowAllTasks(true);
  };

  const handleTaskReorder = async (reorderedTasks: any[]) => {
    if (reorderedTasks.length > 0) {
      console.log('🔄 TaskView task reorder, count:', reorderedTasks.length);
      console.log('🔍 First few tasks:', reorderedTasks.slice(0, 3).map(t => ({ id: t.id, name: t.name })));
      
      // For TaskView, we need to be careful about partial task lists (like Recent Tasks showing only 5)
      // We should update the full task list in the global state, not just the subset being reordered
      const allTasks = [...tasks];
      const allActiveTasks = allTasks.filter(t => t.status !== 'Complete');
      
      // If we're reordering fewer tasks than total active tasks, it's a "Recent Tasks" reorder
      const isPartialReorder = reorderedTasks.length < allActiveTasks.length;
      
      if (isPartialReorder) {
        console.log('🔍 Partial reorder detected (Recent Tasks), mapping to full task list');
        // Map the reordered positions back to the full task list
        reorderedTasks.forEach((reorderedTask, newIndex) => {
          const taskIndex = allTasks.findIndex(t => t.id === reorderedTask.id);
          if (taskIndex !== -1) {
            allTasks[taskIndex] = {
              ...allTasks[taskIndex],
              position: newIndex + 1,
              updated_at: new Date().toISOString(),
            };
          }
        });
        
        console.log('🎯 Updating full task list state');
        dispatch({ type: 'SET_TASKS', payload: allTasks });
      } else {
        console.log('🔍 Full list reorder, updating normally');
        const tasksWithNewPositions = reorderedTasks.map((task, index) => ({
          ...task,
          position: index + 1,
          updated_at: new Date().toISOString(),
        }));
        dispatch({ type: 'SET_TASKS', payload: tasksWithNewPositions });
      }
      
      // Background database sync
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          for (let i = 0; i < reorderedTasks.length; i++) {
            const task = reorderedTasks[i];
            await supabase
              .from('tasks')
              .update({ 
                position: i + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', task.id)
              .eq('user_id', user.id);
          }
          
          console.log('🎉 TaskView positions synced to database');
        } catch (error) {
          console.error('💥 TaskView database sync failed:', error);
          // On error, refetch to restore correct state
          await fetchTasks();
        }
      }, 0);
    }
  };

  // If showing all tasks view
  if (showAllTasks) {
    return (
      <div className="space-y-8">
        {/* Add Task Section - Same as main view */}
        <div className={`rounded-2xl border p-6 transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-light transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Add New Task</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedForm(!showDetailedForm)}
              className={`transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              }`}
            >
              {showDetailedForm ? 'Quick Add' : 'Detailed Form'}
            </Button>
          </div>
          
          {showDetailedForm ? (
            <TaskForm 
              defaultCategoryId={selectedCategory?.id}
              onCreated={handleTaskCreated}
            />
          ) : (
            <AddTaskInput 
              defaultCategoryId={selectedCategory?.id}
              onTaskCreated={handleTaskCreated}
            />
          )}
        </div>

        {/* All Tasks List */}
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-light transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>All Tasks</h2>
          <Button variant="ghost" onClick={handleBackToGrid} className={`transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
          }`}>
            Back to Tasks
          </Button>
        </div>
        <div className={`rounded-2xl border p-6 transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <TaskList
            tasks={tasks.filter(t => t.status !== 'Complete')}
            showCategory={true}
            emptyMessage="No active tasks yet. Create some tasks to get started!"
            onTaskReorder={handleTaskReorder}
            theme={theme}
          />
        </div>

        {/* Quick Overview - Same as main view */}
        {(categories.length > 0 || tasks.length > 0) && (
          <div className={`border rounded-2xl p-4 transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-100'
          }`}>
            <h3 className={`font-light mb-2 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Quick Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Categories:</span>
                <span className={`font-medium ml-2 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{categories.length}</span>
              </div>
              <div>
                <span className={`transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Total Tasks:</span>
                <span className={`font-medium ml-2 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{tasks.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If a category is selected, show the detailed task view
  if (selectedCategory) {
    return (
      <CategoryTasksView 
        category={selectedCategory} 
        onBack={handleBackToGrid}
        theme={theme}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Minimal Add Task Section */}
      <div className={`rounded-2xl border p-6 transition-colors ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-light transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Add New Task</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedForm(!showDetailedForm)}
            className={`transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            {showDetailedForm ? 'Quick Add' : 'Detailed Form'}
          </Button>
        </div>
        
        {showDetailedForm ? (
          <TaskForm 
            defaultCategoryId={selectedCategory?.id}
            onCreated={handleTaskCreated}
          />
        ) : (
          <AddTaskInput 
            defaultCategoryId={selectedCategory?.id}
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>

      {/* Categories Grid */}
      <div className={`rounded-2xl border p-6 transition-colors ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <DraggableCategoryGrid
          onCategorySelect={handleCategorySelect}
          showCreateButton={true}
          theme={theme}
        />
      </div>

      {/* Recent Tasks */}
      {tasks.length > 0 && (
        <div className={`rounded-2xl border p-6 transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-light mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Recent Tasks</h3>
          <TaskList
            tasks={tasks.filter(t => t.status !== 'Complete').slice(0, 5)}
            showCategory={true}
            emptyMessage="No recent tasks"
            onTaskReorder={handleTaskReorder}
            theme={theme}
          />
          {tasks.filter(t => t.status !== 'Complete').length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={handleViewAllTasks} className={`transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              }`}>
                View All Tasks ({tasks.filter(t => t.status !== 'Complete').length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Minimal Stats */}
      {(categories.length > 0 || tasks.length > 0) && (
        <div className={`border rounded-2xl p-4 transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-100'
        }`}>
          <h3 className={`font-light mb-2 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Quick Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Categories:</span>
              <span className={`font-medium ml-2 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{categories.length}</span>
            </div>
            <div>
              <span className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Active Tasks:</span>
              <span className={`font-medium ml-2 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{tasks.filter(t => t.status !== 'Complete').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}