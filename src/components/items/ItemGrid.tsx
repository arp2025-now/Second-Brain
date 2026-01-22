import { Item, Category } from '../../types';
import { ItemCard } from './ItemCard';
import { FileQuestion } from 'lucide-react';

interface ItemGridProps {
  items: Item[];
  categories: Category[];
  isLoading: boolean;
  onToggleStatus: (item: Item) => void;
  onAddToCalendar: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onMoveToCategory: (item: Item, categoryId: string | null) => void;
  onArchive: (item: Item) => void;
  onToggleFavorite: (item: Item) => void;
}

export function ItemGrid({
  items,
  categories,
  isLoading,
  onToggleStatus,
  onAddToCalendar,
  onEdit,
  onDelete,
  onMoveToCategory,
  onArchive,
  onToggleFavorite,
}: ItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-7 h-7 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileQuestion className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
        <p className="text-gray-500 max-w-sm">
          Start capturing ideas, links, and notes using the input above.
          Your second brain awaits!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          categories={categories}
          onToggleStatus={onToggleStatus}
          onAddToCalendar={onAddToCalendar}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveToCategory={onMoveToCategory}
          onArchive={onArchive}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
