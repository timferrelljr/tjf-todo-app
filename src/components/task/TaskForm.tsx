import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import type { CreateTaskData, TaskPriority, TaskStatus } from '../../lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Calendar, CheckCircle, Clock } from 'lucide-react';

interface TaskFormProps {
  onCancel?: () => void;
  onCreated?: () => void;
  defaultCategoryId?: string;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Important', label: 'Important' },
  { value: 'Urgent', label: 'Urgent' },
];

const STATUSES: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'Not Started', label: 'Not Started', icon: <Clock className="w-4 h-4 text-gray-500" /> },
  { value: 'In Progress', label: 'In Progress', icon: <Clock className="w-4 h-4 text-gray-500" /> },
  { value: 'Waiting for...', label: 'Waiting for...', icon: <Clock className="w-4 h-4 text-gray-500" /> },
  { value: 'Complete', label: 'Complete', icon: <CheckCircle className="w-4 h-4 text-gray-500" /> },
];

export function TaskForm({ onCancel, onCreated, defaultCategoryId }: TaskFormProps) {
  const { createTask } = useTasks();
  const { categories } = useCategories();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<Omit<CreateTaskData, 'position'>>({
    name: '',
    notes: '',
    category_id: defaultCategoryId || (categories[0]?.id ?? ''),
    priority: 'Standard',
    status: 'Not Started',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) return;

    setIsCreating(true);
    const result = await createTask({
      ...formData,
      name: formData.name.trim(),
      description: formData.notes?.trim() || undefined,
      due_date: formData.due_date || undefined,
    });

    if (!result.error) {
      setFormData({
        name: '',
        notes: '',
        category_id: defaultCategoryId || (categories[0]?.id ?? ''),
        priority: 'Standard',
        status: 'Not Started',
        due_date: '',
      });
      onCreated?.();
    }
    setIsCreating(false);
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const selectedCategory = categories.find(c => c.id === formData.category_id);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Create New Task</h3>
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Enter task name"
            required
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => updateFormData({ category_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-gray-400 min-h-[44px]"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              {selectedCategory.name}
            </div>
          )}
        </div>

        {/* Priority and Status Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <div className="space-y-1">
              {PRIORITIES.map((priority) => (
                <label key={priority.value} className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => updateFormData({ priority: e.target.value as TaskPriority })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="space-y-1">
              {STATUSES.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={formData.status === status.value}
                    onChange={(e) => updateFormData({ status: e.target.value as TaskStatus })}
                    className="mr-2"
                  />
                  <div className="flex items-center text-sm">
                    {status.icon}
                    <span className="ml-2">{status.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Due Date (optional)
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => updateFormData({ due_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-gray-400 min-h-[44px]"
            min={new Date().toISOString().split('T')[0]} 
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Add any additional notes..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!formData.name.trim() || !formData.category_id || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}