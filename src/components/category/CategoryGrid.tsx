import { useState } from 'react';
import type { Category } from '../../lib/types';
// import { useCategories } from '../../hooks/useCategories'; // TODO: Will be used for drag and drop
import { CategoryCard } from './CategoryCard';
import { CreateCategoryCard } from './CreateCategoryCard';
import { Button } from '../ui/Button';
import { Plus, Palette } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect?: (category: Category) => void;
  showCreateButton?: boolean;
}

export function CategoryGrid({ 
  categories, 
  onCategorySelect, 
  showCreateButton = true 
}: CategoryGridProps) {
  // const { reorderCategories } = useCategories(); // TODO: Implement drag and drop
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCategoryCreated = () => {
    setShowCreateForm(false);
  };

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category);
  };

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      {showCreateButton && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Create category card */}
        {showCreateForm && (
          <CreateCategoryCard 
            onCancel={() => setShowCreateForm(false)}
            onCreated={handleCategoryCreated}
          />
        )}

        {/* Existing categories */}
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="cursor-pointer"
          >
            <CategoryCard
              category={category}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ))}

        {/* Empty state */}
        {categories.length === 0 && !showCreateForm && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Palette className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-sm text-center mb-4">
              Create your first category to start organizing your tasks
            </p>
            {showCreateButton && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}