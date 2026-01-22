import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { QuickCapture } from '../components/layout/QuickCapture';
import { ItemGrid } from '../components/items/ItemGrid';
import { EditItemModal } from '../components/items/EditItemModal';
import { Item, Category, ItemType } from '../types';
import * as db from '../lib/database';
import { processNewItem, addToCalendar } from '../lib/n8n';

export function Dashboard() {
  const { user } = useAuth();

  // State
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  // Edit modal state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [categoriesData, itemsData, counts] = await Promise.all([
        db.getCategories(user.id),
        selectedCategoryId
          ? db.getItems(user.id, selectedCategoryId)
          : db.getItems(user.id),
        db.getItemCounts(user.id),
      ]);

      setCategories(categoriesData);
      setItems(itemsData);
      setItemCounts(counts.byCategory);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search
  useEffect(() => {
    const searchItems = async () => {
      if (!user || !searchQuery.trim()) {
        loadData();
        return;
      }

      try {
        const results = await db.searchItems(user.id, searchQuery);
        setItems(results);
      } catch (error) {
        console.error('Error searching:', error);
      }
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user, loadData]);

  // Quick capture handler
  const handleCapture = async (input: string, type: ItemType) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // First, try to process with n8n for AI categorization
      let title = input.slice(0, 100);
      let summary: string | undefined;
      let suggestedCategoryId: string | undefined;
      let aiTags: string[] = [];
      let url: string | undefined;

      try {
        const aiResult = await processNewItem({
          input,
          userId: user.id,
        });

        title = aiResult.title || title;
        summary = aiResult.summary;
        aiTags = aiResult.tags || [];
        url = aiResult.url;

        // Find matching category
        if (aiResult.category) {
          const matchedCategory = categories.find(
            (c) => c.name.toLowerCase() === aiResult.category.toLowerCase()
          );
          if (matchedCategory) {
            suggestedCategoryId = matchedCategory.id;
          }
        }
      } catch (error) {
        console.warn('AI processing failed, creating item without AI:', error);
        // If it's a URL, use it directly
        if (type === 'link') {
          url = input;
        }
      }

      // Create the item in Supabase
      const newItem = await db.createItem({
        user_id: user.id,
        title,
        content: type !== 'link' ? input : undefined,
        url,
        summary,
        item_type: type,
        category_id: suggestedCategoryId || selectedCategoryId || undefined,
        ai_tags: aiTags.length > 0 ? aiTags : undefined,
        ai_processed: true,
      });

      setItems((prev) => [newItem, ...prev]);

      // Refresh counts
      const counts = await db.getItemCounts(user.id);
      setItemCounts(counts.byCategory);
    } catch (error) {
      console.error('Error capturing item:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Item actions
  const handleToggleStatus = async (item: Item) => {
    try {
      const updated = await db.toggleItemStatus(item.id, item.status);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? updated : i))
      );
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleAddToCalendar = async (item: Item) => {
    if (!user) return;

    try {
      const result = await addToCalendar({
        itemId: item.id,
        title: item.title,
        description: item.summary || item.content || '',
        userId: user.id,
      });

      if (result.success) {
        alert('Added to calendar!');
      } else {
        alert('Failed to add to calendar: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (itemId: string, updates: {
    title?: string;
    content?: string;
    url?: string;
    category_id?: string | null;
  }) => {
    try {
      const updated = await db.updateItem(itemId, updates);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? updated : i))
      );
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (item: Item) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await db.deleteItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      // Refresh counts
      if (user) {
        const counts = await db.getItemCounts(user.id);
        setItemCounts(counts.byCategory);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleMoveToCategory = async (item: Item, categoryId: string | null) => {
    try {
      const updated = await db.moveToCategory(item.id, categoryId);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? updated : i))
      );

      // Refresh counts
      if (user) {
        const counts = await db.getItemCounts(user.id);
        setItemCounts(counts.byCategory);
      }
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const handleArchive = async (item: Item) => {
    try {
      const updated = await db.archiveItem(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? updated : i))
      );
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleToggleFavorite = async (item: Item) => {
    try {
      const updated = await db.updateItem(item.id, {
        is_favorite: !item.is_favorite,
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? updated : i))
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Category actions
  const handleCreateCategory = async (name: string, icon: string, color: string) => {
    if (!user) return;

    try {
      const newCategory = await db.createCategory({
        user_id: user.id,
        name,
        icon,
        color,
      });
      setCategories((prev) => [...prev, newCategory]);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (
    id: string,
    name: string,
    icon: string,
    color: string
  ) => {
    try {
      const updated = await db.updateCategory(id, { name, icon, color });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? Items in this folder will be uncategorized.')) return;

    try {
      await db.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          itemCounts={itemCounts}
        />
      </div>

      {/* Sidebar - Mobile (overlay) */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative">
            <Sidebar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                setIsSidebarOpen(false);
              }}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              itemCounts={itemCounts}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
          title={selectedCategory?.name || 'All Items'}
        />

        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {/* Quick Capture */}
          <div className="mb-4 sm:mb-6">
            <QuickCapture onCapture={handleCapture} isProcessing={isProcessing} />
          </div>

          {/* Items Grid */}
          <ItemGrid
            items={items}
            categories={categories}
            isLoading={isLoading}
            onToggleStatus={handleToggleStatus}
            onAddToCalendar={handleAddToCalendar}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveToCategory={handleMoveToCategory}
            onArchive={handleArchive}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </main>

      {/* Edit Modal */}
      <EditItemModal
        item={editingItem}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
