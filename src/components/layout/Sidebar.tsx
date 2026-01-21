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
  Sparkles,
  Star,
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
  const totalItems = Object.values(itemCounts).reduce((a, b) => a + b, 0);

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
          group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
          transition-all duration-200
          ${isSelected
            ? 'bg-indigo-100 text-indigo-700 shadow-sm'
            : 'hover:bg-gray-100 text-gray-700'
          }
        `}
        onClick={() => onSelectCategory(category.id)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-200' : ''}`}
            style={{ backgroundColor: isSelected ? undefined : `${category.color}15` }}
          >
            <span style={{ color: isSelected ? undefined : category.color }}>
              <Icon className="w-4 h-4" />
            </span>
          </div>
          <span className="text-sm font-medium">{category.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {count}
            </span>
          )}

          {!category.is_system && (
            <DropdownMenu
              trigger={
                <button
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-lg transition-all"
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
    <aside className="w-72 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Second Brain</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              AI-powered knowledge
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* All Items */}
        <div
          className={`
            flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer
            transition-all duration-200
            ${selectedCategoryId === null
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200'
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }
          `}
          onClick={() => onSelectCategory(null)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${selectedCategoryId === null ? 'bg-white/20' : 'bg-indigo-100'}`}>
              <Star className={`w-4 h-4 ${selectedCategoryId === null ? 'text-white' : 'text-indigo-600'}`} />
            </div>
            <span className="font-semibold">All Items</span>
          </div>
          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
            selectedCategoryId === null ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'
          }`}>
            {totalItems}
          </span>
        </div>

        {/* System Categories */}
        <div>
          <button
            className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 w-full hover:text-gray-600 transition-colors"
            onClick={() => toggleSection('system')}
          >
            {expandedSections.system ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between mb-3">
            <button
              className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={() => toggleSection('custom')}
            >
              {expandedSections.custom ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              Custom Folders
            </button>
            <button
              className="p-1.5 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-all text-gray-400"
              onClick={() => setIsCreateModalOpen(true)}
              title="Create folder"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {expandedSections.custom && (
            <div className="space-y-1">
              {customCategories.length > 0 ? (
                customCategories.map(renderCategoryItem)
              ) : (
                <p className="text-sm text-gray-400 px-3 py-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No custom folders yet
                </p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <div className="truncate min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={signOut}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-500"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
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
                    className={`p-3 rounded-xl border-2 transition-all ${
                      newCategoryIcon === icon
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
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
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${
                    newCategoryColor === color
                      ? 'border-gray-900 scale-110 shadow-lg'
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
                    className={`p-3 rounded-xl border-2 transition-all ${
                      newCategoryIcon === icon
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
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
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${
                    newCategoryColor === color
                      ? 'border-gray-900 scale-110 shadow-lg'
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
