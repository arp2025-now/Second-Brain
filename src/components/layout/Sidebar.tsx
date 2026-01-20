import { useState } from 'react';
import {
  Brain,
  Plus,
  Inbox,
  StickyNote,
  Heart,
  Archive,
  Folder,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Category } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { DropdownMenu, DropdownItem } from '../ui/DropdownMenu';

// Icon mapping for categories
const iconMap: Record<string, LucideIcon> = {
  inbox: Inbox,
  'sticky-note': StickyNote,
  heart: Heart,
  archive: Archive,
  folder: Folder,
};

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onCreateCategory: (name: string, icon: string, color: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string, icon: string, color: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  itemCounts: Record<string, number>;
}

export function Sidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  itemCounts,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [expandedSections, setExpandedSections] = useState({
    system: true,
    custom: true,
  });

  const systemCategories = categories.filter((c) => c.is_system);
  const customCategories = categories.filter((c) => !c.is_system);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await onCreateCategory(newCategoryName, newCategoryIcon, newCategoryColor);
    setNewCategoryName('');
    setNewCategoryIcon('folder');
    setNewCategoryColor('#6366f1');
    setIsCreateModalOpen(false);
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    await onUpdateCategory(editingCategory.id, newCategoryName, newCategoryIcon, newCategoryColor);
    setEditingCategory(null);
    setNewCategoryName('');
    setIsEditModalOpen(false);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryColor(category.color);
    setIsEditModalOpen(true);
  };

  const renderCategoryItem = (category: Category) => {
    const Icon = iconMap[category.icon] || Folder;
    const isSelected = selectedCategoryId === category.id;
    const count = itemCounts[category.id] || 0;

    return (
      <div
        key={category.id}
        className={`
          group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
          transition-colors
          ${isSelected ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-700'}
        `}
        onClick={() => onSelectCategory(category.id)}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: isSelected ? undefined : category.color }}>
            <Icon className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium">{category.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}

          {!category.is_system && (
            <DropdownMenu
              trigger={
                <button
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              }
            >
              <DropdownItem onClick={() => openEditModal(category)}>
                <Pencil className="w-4 h-4" />
                Edit
              </DropdownItem>
              <DropdownItem
                variant="danger"
                onClick={() => onDeleteCategory(category.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownItem>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const toggleSection = (section: 'system' | 'custom') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#64748b',
  ];

  const icons = ['folder', 'inbox', 'sticky-note', 'heart', 'archive'];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Second Brain</h1>
            <p className="text-xs text-gray-500">Your knowledge hub</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* All Items */}
        <div
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
            transition-colors
            ${selectedCategoryId === null ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-700'}
          `}
          onClick={() => onSelectCategory(null)}
        >
          <div className="flex items-center gap-3">
            <Inbox className="w-5 h-5" />
            <span className="text-sm font-medium">All Items</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {Object.values(itemCounts).reduce((a, b) => a + b, 0)}
          </span>
        </div>

        {/* System Categories */}
        <div>
          <button
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 w-full"
            onClick={() => toggleSection('system')}
          >
            {expandedSections.system ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Folders
          </button>
          {expandedSections.system && (
            <div className="space-y-1">
              {systemCategories.map(renderCategoryItem)}
            </div>
          )}
        </div>

        {/* Custom Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              onClick={() => toggleSection('custom')}
            >
              {expandedSections.custom ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Custom Folders
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          {expandedSections.custom && (
            <div className="space-y-1">
              {customCategories.length > 0 ? (
                customCategories.map(renderCategoryItem)
              ) : (
                <p className="text-sm text-gray-400 px-3 py-2">
                  No custom folders yet
                </p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={signOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Folder"
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter folder name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex gap-2">
              {icons.map((icon) => {
                const IconComponent = iconMap[icon] || Folder;
                return (
                  <button
                    key={icon}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      newCategoryIcon === icon
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setNewCategoryIcon(icon)}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    newCategoryColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategoryColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create Folder</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Folder"
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter folder name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex gap-2">
              {icons.map((icon) => {
                const IconComponent = iconMap[icon] || Folder;
                return (
                  <button
                    key={icon}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      newCategoryIcon === icon
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setNewCategoryIcon(icon)}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    newCategoryColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategoryColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
