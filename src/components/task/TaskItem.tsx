import { useState } from 'react';
import type { Task } from '../../lib/types';
import { useTasks } from '../../hooks/useTasks';
import { EditTaskModal } from './EditTaskModal';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  showCategory?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  theme?: 'light' | 'dark';
}

const priorityLabels = {
  'Standard': 'Standard',
  'Important': 'Important', 
  'Urgent': 'Urgent',
};

const statusLabels = {
  'Not Started': 'Not Started',
  'In Progress': 'In Progress',
  'Waiting for...': 'Waiting',
  'Complete': 'Complete',
};

export function TaskItem({ task, showCategory: _showCategory = false, onEdit, onDelete, theme = 'light' }: TaskItemProps) {
  const { updateTask, deleteTask } = useTasks();
  const [showEditModal, setShowEditModal] = useState(false);
  
  // TODO: Use showCategory to display category info

  const handleStatusToggle = async () => {
    const newStatus = task.status === 'Complete' ? 'Not Started' : 'Complete';
    await updateTask({
      id: task.id,
      status: newStatus,
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      console.log('Deleting task:', task.id);
      await deleteTask(task.id);
      onDelete?.(task.id);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSaved = () => {
    onEdit?.(task);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Complete';

  return (
    <div className={`flex items-center space-x-4 p-3 rounded-lg transition-colors group ${
      theme === 'dark'
        ? 'hover:bg-gray-700 active:bg-gray-600'
        : 'hover:bg-gray-50 active:bg-gray-100'
    }`}>
      <button
        onClick={handleStatusToggle}
        className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors p-2 ${
          task.status === 'Complete' 
            ? theme === 'dark'
              ? 'border-gray-500 bg-gray-500'
              : 'border-gray-400 bg-gray-400'
            : theme === 'dark'
              ? 'border-gray-500 hover:border-gray-400 active:border-gray-300'
              : 'border-gray-300 hover:border-gray-400 active:border-gray-500'
        }`}
      >
        {task.status === 'Complete' && (
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      <div className="flex-1 cursor-pointer" onClick={handleEdit}>
        <div className={`transition-colors ${
          task.status === 'Complete' 
            ? theme === 'dark'
              ? 'line-through text-gray-500'
              : 'line-through text-gray-500'
            : theme === 'dark'
              ? 'text-white'
              : 'text-gray-900'
        }`}>
          {task.name}
        </div>
        <div className={`text-xs mt-1 transition-colors ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {priorityLabels[task.priority]} • {statusLabels[task.status]}
          {task.due_date && ` • ${formatDate(task.due_date)}`}
          {isOverdue && ' (Overdue)'}
        </div>
      </div>

      {/* Actions - Only visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className={`transition-colors ${
            theme === 'dark'
              ? 'text-gray-500 hover:text-gray-300 active:bg-gray-700'
              : 'text-gray-400 hover:text-gray-600 active:bg-gray-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}