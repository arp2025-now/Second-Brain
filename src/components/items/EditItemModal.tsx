import { useState, useEffect } from 'react';
import { Item, Category, ItemType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link, StickyNote, Lightbulb } from 'lucide-react';

interface ItemUpdates {
  title?: string;
  content?: string;
  url?: string;
  category_id?: string | null;
}

interface EditItemModalProps {
  item: Item | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, updates: ItemUpdates) => Promise<void>;
}

export function EditItemModal({
  item,
  categories,
  isOpen,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [itemType, setItemType] = useState<ItemType>('note');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content || '');
      setUrl(item.url || '');
      setCategoryId(item.category_id);
      setItemType(item.item_type);
    }
  }, [item]);

  const handleSave = async () => {
    if (!item || !title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(item.id, {
        title: title.trim(),
        content: content.trim() || undefined,
        url: url.trim() || undefined,
        category_id: categoryId,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const typeOptions = [
    { value: 'link', label: 'Link', icon: Link },
    { value: 'note', label: 'Note', icon: StickyNote },
    { value: 'idea', label: 'Idea', icon: Lightbulb },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="lg">
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
        />

        {itemType === 'link' && (
          <Input
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add notes or content..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="flex gap-2">
            {typeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setItemType(value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                  itemType === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folder
          </label>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">No folder</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
