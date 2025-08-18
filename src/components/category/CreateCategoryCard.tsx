import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Briefcase, Home, Heart, BookOpen, Palette, Star, Target, Coffee, Camera, Music } from 'lucide-react';

interface CreateCategoryCardProps {
  onCancel: () => void;
  onCreated: () => void;
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

export function CreateCategoryCard({ onCancel, onCreated, theme = 'light' }: CreateCategoryCardProps) {
  const { createCategory } = useCategories();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    console.log('Creating category:', { name: name.trim(), color: '#9CA3AF', icon: selectedIcon });
    setIsCreating(true);
    
    try {
      const result = await createCategory({
        name: name.trim(),
        color: '#9CA3AF', // Always use gray color for minimal design
        icon: selectedIcon,
      });

      console.log('Category creation result:', result);

      if (!result.error) {
        onCreated();
      } else {
        console.error('Category creation error:', result.error);
        alert('Failed to create category: ' + result.error);
      }
    } catch (error) {
      console.error('Category creation exception:', error);
      alert('Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const selectedIconData = ICON_OPTIONS.find(opt => opt.name === selectedIcon);
  const IconComponent = selectedIconData?.icon || Briefcase;

  return (
    <Card className={`border transition-colors ${
      theme === 'dark' 
        ? 'border-gray-700 bg-gray-800' 
        : 'border-gray-200 bg-white'
    }`}>
      <div className={`w-full h-24 rounded-t-lg flex items-center justify-center transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700'
          : 'bg-gray-50'
      }`}>
        <div className="mr-3">
          <IconComponent className={`w-5 h-5 transition-colors ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`} />
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Category name"
          className={`text-center text-sm w-32 border transition-colors ${
            theme === 'dark'
              ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
          }`}
          autoFocus
        />
      </div>
      
      <div className="p-4 space-y-4">
        {/* Icon picker */}
        <div>
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
                  onClick={() => setSelectedIcon(option.name)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                    selectedIcon === option.name 
                      ? theme === 'dark'
                        ? 'border-gray-500 bg-gray-700'
                        : 'border-gray-400 bg-gray-50'
                      : theme === 'dark'
                        ? 'border-gray-600 hover:bg-gray-700'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  title={option.label}
                >
                  <IconComponent className={`w-4 h-4 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            variant="ghost"
            className={`flex-1 transition-colors ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Create
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className={`flex-1 transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}