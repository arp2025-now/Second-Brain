import { useState } from 'react';
import {
  Link,
  StickyNote,
  Lightbulb,
  ExternalLink,
  MoreHorizontal,
  Check,
  Circle,
  Calendar,
  Pencil,
  Trash2,
  FolderInput,
  Archive,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { Item, Category } from '../../types';
import { DropdownMenu, DropdownItem } from '../ui/DropdownMenu';
import { extractDomain } from '../../lib/n8n';

interface ItemCardProps {
  item: Item;
  categories: Category[];
  onToggleStatus: (item: Item) => void;
  onAddToCalendar: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onMoveToCategory: (item: Item, categoryId: string | null) => void;
  onArchive: (item: Item) => void;
  onToggleFavorite: (item: Item) => void;
}

export function ItemCard({
  item,
  categories,
  onToggleStatus,
  onAddToCalendar,
  onEdit,
  onDelete,
  onMoveToCategory,
  onArchive,
  onToggleFavorite,
}: ItemCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const typeIcons = {
    link: Link,
    note: StickyNote,
    idea: Lightbulb,
  };

  const TypeIcon = typeIcons[item.item_type];

  const typeColors = {
    link: 'bg-blue-100 text-blue-600',
    note: 'bg-green-100 text-green-600',
    idea: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 p-4
        hover:border-gray-300 hover:shadow-sm transition-all
        ${item.status === 'read' ? 'opacity-75' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Read/Unread toggle */}
          <button
            onClick={() => onToggleStatus(item)}
            className={`
              mt-1 p-1 rounded-full transition-colors
              ${item.status === 'read' ? 'text-primary-600' : 'text-gray-300 hover:text-gray-400'}
            `}
          >
            {item.status === 'read' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mt-0.5"
              >
                {extractDomain(item.url)}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(item)}
            className={`p-1.5 rounded-lg transition-colors ${
              item.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Dropdown menu */}
          <DropdownMenu
            trigger={
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            }
          >
            <DropdownItem onClick={() => onAddToCalendar(item)}>
              <Calendar className="w-4 h-4" />
              Add to Calendar
            </DropdownItem>
            <DropdownItem onClick={() => onEdit(item)}>
              <Pencil className="w-4 h-4" />
              Edit
            </DropdownItem>
            <DropdownItem onClick={() => setShowMoveMenu(!showMoveMenu)}>
              <FolderInput className="w-4 h-4" />
              Move to...
            </DropdownItem>
            <DropdownItem onClick={() => onArchive(item)}>
              <Archive className="w-4 h-4" />
              Archive
            </DropdownItem>
            <DropdownItem variant="danger" onClick={() => onDelete(item)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Content / Summary */}
      {(item.summary || item.content) && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {item.summary || item.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[item.item_type]}`}
          >
            <TypeIcon className="w-3 h-3" />
            {item.item_type}
          </span>

          {/* Category badge */}
          {item.category && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${item.category.color}20`,
                color: item.category.color,
              }}
            >
              {item.category.name}
            </span>
          )}

          {/* AI tags */}
          {item.ai_tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400">
          {format(new Date(item.created_at), 'MMM d')}
        </span>
      </div>

      {/* Move to category menu (expandable) */}
      {showMoveMenu && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Move to folder:</p>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onMoveToCategory(item, category.id);
                  setShowMoveMenu(false);
                }}
                className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                  item.category_id === category.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
