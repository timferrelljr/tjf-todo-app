import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random ID for client-side temporary objects
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dueDate: string | Date): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < now;
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Urgent':
      return 'border-l-red-500 bg-red-50';
    case 'Important':
      return 'border-l-yellow-500 bg-yellow-50';
    case 'Standard':
    default:
      return 'border-l-gray-300 bg-white';
  }
}

/**
 * Get status icon and color
 */
export function getStatusInfo(status: string): { icon: string; color: string } {
  switch (status) {
    case 'Complete':
      return { icon: '✓', color: 'text-green-600' };
    case 'In Progress':
      return { icon: '◐', color: 'text-blue-600' };
    case 'Waiting for...':
      return { icon: '⏳', color: 'text-yellow-600' };
    case 'Not Started':
    default:
      return { icon: '○', color: 'text-gray-400' };
  }
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}