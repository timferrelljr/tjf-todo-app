import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AddTaskInputProps {
  defaultCategoryId?: string;
  onTaskCreated?: () => void;
}

export function AddTaskInput({ defaultCategoryId, onTaskCreated }: AddTaskInputProps) {
  const { createTask } = useTasks();
  const { categories } = useCategories();
  const [taskName, setTaskName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Auto-categorization logic (simplified for now)
  const getDefaultCategory = () => {
    if (defaultCategoryId) {
      return defaultCategoryId;
    }
    
    // If no default, use the first category or create a "General" category
    if (categories.length > 0) {
      return categories[0].id;
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const categoryId = getDefaultCategory();
    if (!categoryId) {
      console.error('No category available for task creation');
      alert('Please create a category first');
      return;
    }

    console.log('Creating task:', { name: taskName.trim(), category_id: categoryId });
    setIsCreating(true);
    
    try {
      const result = await createTask({
        name: taskName.trim(),
        category_id: categoryId,
        priority: 'Standard',
        status: 'Not Started',
      });

      console.log('Task creation result:', result);

      if (!result.error) {
        setTaskName('');
        onTaskCreated?.();
      } else {
        console.error('Task creation error:', result.error);
        alert('Failed to create task: ' + result.error);
      }
    } catch (error) {
      console.error('Task creation exception:', error);
      alert('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add a new task... (it will be auto-categorized)"
            className="text-lg py-3 px-4"
            disabled={isCreating}
          />
        </div>
        <Button
          type="submit"
          disabled={!taskName.trim() || isCreating || categories.length === 0}
          className="px-6 py-3 text-lg"
          title={categories.length === 0 ? "Create a category first" : "Add task"}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      {categories.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Create a category first to start adding tasks
        </p>
      )}
    </form>
  );
}