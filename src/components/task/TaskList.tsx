import type { Task } from '../../lib/types';
import { TaskItem } from './TaskItem';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  showCategory?: boolean;
  emptyMessage?: string;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskReorder?: (tasks: Task[]) => void;
  theme?: 'light' | 'dark';
}

interface SortableTaskItemProps {
  task: Task;
  showCategory?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  theme?: 'light' | 'dark';
}

function SortableTaskItem({ task, showCategory, onEdit, onDelete, theme = 'light' }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle - Touch-friendly */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 cursor-grab active:cursor-grabbing opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
        title="Drag to reorder"
      >
        <GripVertical className={`w-4 h-4 transition-colors ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
        }`} />
      </div>
      
      <div className="pl-8">
        <TaskItem
          task={task}
          showCategory={showCategory}
          onEdit={onEdit}
          onDelete={onDelete}
          theme={theme}
        />
      </div>
    </div>
  );
}

export function TaskList({ 
  tasks, 
  showCategory = false, 
  emptyMessage = "No tasks yet",
  onTaskEdit,
  onTaskDelete,
  onTaskReorder,
  theme = 'light'
}: TaskListProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
        onTaskReorder?.(reorderedTasks);
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className={`text-center py-8 transition-colors ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <p className="text-lg">{emptyMessage}</p>
        <p className="text-sm mt-1">Add a task above to get started</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              showCategory={showCategory}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              theme={theme}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}