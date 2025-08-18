import { useState } from 'react';
import type { Task, TaskPriority, TaskStatus } from '../../lib/types';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, CheckCircle, Clock } from 'lucide-react';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onSaved: () => void;
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

export function EditTaskModal({ task, onClose, onSaved }: EditTaskModalProps) {
  const { updateTask } = useTasks();
  const { categories } = useCategories();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: task.name,
    notes: task.notes || '',
    category_id: task.category_id,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) return;

    setIsUpdating(true);
    const result = await updateTask({
      id: task.id,
      ...formData,
      name: formData.name.trim(),
      notes: formData.notes?.trim() || undefined,
      due_date: formData.due_date || undefined,
    });

    if (!result.error) {
      onSaved();
      onClose();
    }
    setIsUpdating(false);
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };


  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 bg-white">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-light text-gray-900">Edit Task</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600 active:bg-gray-100">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
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
              <label className="block text-sm font-light text-gray-700 mb-2">
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
            </div>

            {/* Priority and Status Row - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-3">
                  Priority
                </label>
                <div className="space-y-2">
                  {PRIORITIES.map((priority) => (
                    <label key={priority.value} className="flex items-center min-h-[44px]">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => updateFormData({ priority: e.target.value as TaskPriority })}
                        className="mr-3 text-gray-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 touch-manipulation">
                        {priority.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-light text-gray-700 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {STATUSES.map((status) => (
                    <label key={status.value} className="flex items-center min-h-[44px]">
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={formData.status === status.value}
                        onChange={(e) => updateFormData({ status: e.target.value as TaskStatus })}
                        className="mr-3 text-gray-600 w-4 h-4"
                      />
                      <div className="flex items-center text-sm text-gray-600 touch-manipulation">
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
              <label className="block text-sm font-light text-gray-700 mb-2">
                Due Date (optional)
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => updateFormData({ due_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-gray-400 min-h-[44px]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
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

            {/* Actions - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                disabled={!formData.name.trim() || !formData.category_id || isUpdating}
                variant="ghost"
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 text-gray-500 hover:text-gray-700 active:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}