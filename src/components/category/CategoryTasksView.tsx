import { useState } from 'react';
import type { Category } from '../../lib/types';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useApp } from '../../stores/AppContext';
import { TaskList } from '../task/TaskList';
import { TaskForm } from '../task/TaskForm';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, Briefcase, Home, Heart, BookOpen, Palette, Star, Target, Coffee, Camera, Music } from 'lucide-react';

interface CategoryTasksViewProps {
  category: Category;
  onBack: () => void;
  theme?: 'light' | 'dark';
}

export function CategoryTasksView({ category, onBack, theme = 'light' }: CategoryTasksViewProps) {
  const { getTasksByCategory, updateTask } = useTasks();
  const { categories } = useCategories();
  const { tasks: allTasks } = useApp();
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const tasks = getTasksByCategory(category.id).filter(t => t.status !== 'Complete');

  const handleTaskCreated = () => {
    setShowTaskForm(false);
  };

  const handleTaskReorder = async (reorderedTasks: any[]) => {
    if (reorderedTasks.length > 0) {
      console.log('Reordering tasks in category:', category.name, reorderedTasks.length);
      
      // Update each task's position in the database
      for (let i = 0; i < reorderedTasks.length; i++) {
        const task = reorderedTasks[i];
        await updateTask({
          id: task.id,
          position: i + 1,
        });
      }
      
      console.log('Category task reorder completed and saved to database');
    }
  };

  const renderIcon = (iconName: string) => {
    const iconProps = { className: `w-5 h-5 transition-colors ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }` };
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase {...iconProps} />;
      case 'Home':
        return <Home {...iconProps} />;
      case 'Heart':
        return <Heart {...iconProps} />;
      case 'BookOpen':
        return <BookOpen {...iconProps} />;
      case 'Palette':
        return <Palette {...iconProps} />;
      case 'Star':
        return <Star {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'Coffee':
        return <Coffee {...iconProps} />;
      case 'Camera':
        return <Camera {...iconProps} />;
      case 'Music':
        return <Music {...iconProps} />;
      default:
        return <span className={`text-xl transition-colors ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>{iconName}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className={`transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
          }`}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            {category.icon && (
              <div>{renderIcon(category.icon)}</div>
            )}
            <h2 className={`text-xl font-light transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{category.name}</h2>
          </div>
        </div>
        
        <Button
          onClick={() => setShowTaskForm(true)}
          variant="ghost"
          className={`transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 active:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
          }`}
        >
          + Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showTaskForm && (
        <Card className={`border rounded-2xl p-6 transition-colors ${
          theme === 'dark' 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-100 bg-white'
        }`}>
          <TaskForm
            defaultCategoryId={category.id}
            onCreated={handleTaskCreated}
            onCancel={() => setShowTaskForm(false)}
          />
        </Card>
      )}

      {/* Tasks */}
      <div>
        <h3 className={`text-lg font-light mb-6 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Active Tasks ({tasks.length})
        </h3>
        <div className={`border rounded-2xl p-6 transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <TaskList
            tasks={tasks}
            emptyMessage={`No active tasks in ${category.name} yet`}
            onTaskReorder={handleTaskReorder}
            theme={theme}
          />
        </div>
      </div>

      {/* Quick Overview */}
      {(categories.length > 0 || allTasks.length > 0) && (
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
              }`}>{allTasks.filter(t => t.status !== 'Complete').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}