import { useState } from 'react';
import type { Category } from '../../lib/types';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Edit2, Trash2, Check, X, Briefcase, Home, Heart, BookOpen, Palette, Star, Target, Coffee, Camera, Music } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  theme?: 'light' | 'dark';
}

const ICON_OPTIONS = [
  { name: 'Briefcase', icon: Briefcase, label: 'Work' },
  { name: 'Home', icon: Home, label: 'Personal' },
  { name: 'Heart', icon: Heart, label: 'Health' },
  { name: 'BookOpen', icon: BookOpen, label: 'Learning' },
  { name: 'Palette', icon: Palette, label: 'Creative' },
  { name: 'Star', icon: Star, label: 'Important' },
  { name: 'Target', icon: Target, label: 'Goals' },
  { name: 'Coffee', icon: Coffee, label: 'Lifestyle' },
  { name: 'Camera', icon: Camera, label: 'Projects' },
  { name: 'Music', icon: Music, label: 'Hobbies' },
];

export function CategoryCard({ category, onEdit, onDelete, theme = 'light' }: CategoryCardProps) {
  const { getTasksByCategory } = useTasks();
  const { updateCategory, deleteCategory } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editIcon, setEditIcon] = useState(category.icon || 'Briefcase');
  const [isDeleting, setIsDeleting] = useState(false);

  const activeTasks = getTasksByCategory(category.id).filter(t => t.status !== 'Complete');
  const taskCount = activeTasks.length;

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(category.name);
    setEditIcon(category.icon || 'Briefcase');
  };

  const handleSave = async () => {
    if (editName.trim() && (editName !== category.name || editIcon !== category.icon)) {
      await updateCategory({
        id: category.id,
        name: editName.trim(),
        icon: editIcon,
      });
      onEdit?.(category);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(category.name);
    setEditIcon(category.icon || 'Briefcase');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    // Show confirmation dialog if category has tasks
    if (taskCount > 0) {
      const confirmed = window.confirm(
        `This category "${category.name}" contains ${taskCount} task${taskCount > 1 ? 's' : ''}. ` +
        `Deleting it will also delete all tasks in this category. Are you sure you want to continue?`
      );
      if (!confirmed) {
        return;
      }
    }

    setIsDeleting(true);
    const result = await deleteCategory(category.id);
    if (!result.error) {
      onDelete?.(category.id);
    } else {
      alert(`Failed to delete category: ${result.error}`);
    }
    setIsDeleting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderIcon = (iconName: string) => {
    const iconProps = { 
      className: `w-5 h-5 transition-colors ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }` 
    };
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
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>{iconName}</span>;
    }
  };

  return (
    <Card className={`relative group hover:shadow-sm transition-all duration-200 border ${
      theme === 'dark' 
        ? 'border-gray-700 bg-gray-800' 
        : 'border-gray-100 bg-white'
    }`}>
      <div className={`w-full h-24 rounded-t-lg flex items-center justify-center text-lg font-light transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700 text-gray-200'
          : 'bg-gray-50 text-gray-900'
      }`}>
        {category.icon && (
          <div className="mr-3">{renderIcon(category.icon)}</div>
        )}
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`text-center text-sm border transition-colors ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-gray-200'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
            autoFocus
          />
        ) : (
          <span className="text-center px-3">{category.name}</span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xl font-light transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{taskCount}</span>
          <span className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        
        {/* Task preview */}
        {taskCount > 0 && (
          <div className="mb-3">
            <div className={`text-xs mb-1 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>Recent tasks:</div>
            <div className="space-y-1">
              {activeTasks.slice(0, 2).map((task) => (
                <div key={task.id} className={`text-xs truncate transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  • {task.name}
                </div>
              ))}
              {taskCount > 2 && (
                <div className={`text-xs transition-colors ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  +{taskCount - 2} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Icon picker for editing */}
        {isEditing && (
          <div className="mb-4">
            <label className={`block text-sm font-light mb-3 transition-colors ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Choose an icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={() => setEditIcon(option.name)}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                      editIcon === option.name 
                        ? theme === 'dark'
                          ? 'border-gray-500 bg-gray-700'
                          : 'border-gray-400 bg-gray-50'
                        : theme === 'dark'
                          ? 'border-gray-600 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    title={option.label}
                    type="button"
                  >
                    <IconComponent className={`w-3 h-3 transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimal action buttons */}
        <div className={`mt-3 flex gap-2 transition-opacity ${
          isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className={`flex-1 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                disabled={!editName.trim()}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className={`flex-1 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className={`flex-1 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                className={`flex-1 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={taskCount > 0 ? `Delete category and ${taskCount} task${taskCount > 1 ? 's' : ''}` : "Delete category"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}