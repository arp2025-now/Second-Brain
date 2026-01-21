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
  Sparkles,
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

  const typeConfig = {
    link: { icon: Link, bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    note: { icon: StickyNote, bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    idea: { icon: Lightbulb, bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
  };

  const config = typeConfig[item.item_type];
  const TypeIcon = config.icon;

  return (
    <div
      className={`
        group relative bg-white rounded-2xl border-2 overflow-hidden
        transition-all duration-200 ease-out
        ${item.status === 'read'
          ? 'border-gray-100 opacity-70 hover:opacity-100'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50'
        }
      `}
    >
      {/* Colored accent bar */}
      <div className={`h-1 ${config.bg}`} />

      <div className="p-4">
        {/* Quick actions bar - visible on hover */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleStatus(item)}
            className={`p-2 rounded-xl transition-all ${
              item.status === 'read'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600'
            }`}
            title={item.status === 'read' ? 'Mark unread' : 'Mark as read'}
          >
            {item.status === 'read' ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onToggleFavorite(item)}
            className={`p-2 rounded-xl transition-all ${
              item.is_favorite
                ? 'bg-amber-100 text-amber-500'
                : 'bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-500'
            }`}
            title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onArchive(item)}
            className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>

          <DropdownMenu
            trigger={
              <button className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all">
                <MoreHorizontal className="w-4 h-4" />
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
            <DropdownItem variant="danger" onClick={() => onDelete(item)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownItem>
          </DropdownMenu>
        </div>

        {/* Type icon + Title */}
        <div className="flex items-start gap-3 pr-32">
          <div className={`p-2.5 rounded-xl ${config.light}`}>
            <TypeIcon className={`w-5 h-5 ${config.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 leading-tight mb-1">
              {item.title}
            </h3>

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {extractDomain(item.url)}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* AI Summary - prominent display */}
        {item.summary && (
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-medium mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Summary
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {item.summary}
            </p>
          </div>
        )}

        {/* Content preview (if no summary) */}
        {!item.summary && item.content && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {item.content}
          </p>
        )}

        {/* Tags and metadata */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category badge */}
            {item.category && (
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${item.category.color}15`,
                  color: item.category.color,
                }}
              >
                {item.category.name}
              </span>
            )}

            {/* AI tags */}
            {item.ai_tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400 font-medium">
            {format(new Date(item.created_at), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Move to category menu */}
        {showMoveMenu && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-2">Move to folder:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onMoveToCategory(item, category.id);
                    setShowMoveMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    item.category_id === category.id
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
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
    </div>
  );
}
