import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category } from '../../lib/types';
import { useCategories } from '../../hooks/useCategories';
import { useApp } from '../../stores/AppContext';
import { CategoryCard } from './CategoryCard';
import { CreateCategoryCard } from './CreateCategoryCard';
import { Button } from '../ui/Button';
import { GripVertical } from 'lucide-react';

interface SortableCategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  onCategoryClick?: () => void;
  theme?: 'light' | 'dark';
}

function SortableCategoryCard({ category, onEdit, onDelete, onCategoryClick, theme = 'light' }: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Minimal drag handle - Touch-friendly */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-2 right-2 z-20 backdrop-blur-sm rounded-lg p-2 cursor-grab active:cursor-grabbing opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${
          theme === 'dark'
            ? 'bg-gray-800/90 hover:bg-gray-700'
            : 'bg-white/90 hover:bg-white'
        }`}
        title="Drag to reorder"
      >
        <GripVertical className={`w-4 h-4 transition-colors ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`} />
      </div>
      
      <div 
        className="group cursor-pointer" 
        onClick={() => {
          // Only trigger click if not dragging
          if (!isDragging) {
            onCategoryClick?.();
          }
        }}
      >
        <CategoryCard
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          theme={theme}
        />
      </div>
    </div>
  );
}

interface DraggableCategoryGridProps {
  onCategorySelect?: (category: Category) => void;
  showCreateButton?: boolean;
  theme?: 'light' | 'dark';
}

export function DraggableCategoryGrid({ 
  onCategorySelect, 
  showCreateButton = true,
  theme = 'light'
}: DraggableCategoryGridProps) {
  const { categories } = useCategories();
  const { dispatch } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (better for touch)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCategoryCreated = () => {
    setShowCreateForm(false);
  };

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over?.id);
      
      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update positions for instant response
      const categoriesWithUpdatedPositions = reorderedCategories.map((category, index) => ({
        ...category,
        position: index + 1,
        updated_at: new Date().toISOString(),
      }));

      // Update store directly for instant response
      dispatch({ type: 'SET_CATEGORIES', payload: categoriesWithUpdatedPositions });
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimal header with create button */}
      {showCreateButton && (
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="ghost"
            className={`transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            + Add Category
          </Button>
        </div>
      )}

      {/* Category Grid with Drag and Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Create category card */}
          {showCreateForm && (
            <CreateCategoryCard 
              onCancel={() => setShowCreateForm(false)}
              onCreated={handleCategoryCreated}
              theme={theme}
            />
          )}

          {/* Sortable Categories */}
          <SortableContext 
            items={categories.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            {categories.map((category) => (
              <SortableCategoryCard
                key={category.id}
                category={category}
                onEdit={() => {}}
                onDelete={() => {}}
                onCategoryClick={() => handleCategoryClick(category)}
                theme={theme}
              />
            ))}
          </SortableContext>

          {/* Minimal empty state */}
          {categories.length === 0 && !showCreateForm && (
            <div className={`col-span-full flex flex-col items-center justify-center py-12 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className={`w-8 h-8 mx-auto mb-4 transition-colors ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-300'
              }`}>📁</div>
              <p className={`mb-4 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>No categories yet</p>
              {showCreateButton && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="ghost"
                  className={`transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  + Create Category
                </Button>
              )}
            </div>
          )}
        </div>
      </DndContext>

    </div>
  );
}