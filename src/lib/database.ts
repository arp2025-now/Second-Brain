// =============================================
// Database Operations Service
// =============================================

import { supabase } from './supabase';
import type { Item, Category, ItemType, ItemStatus } from '../types';

// =============================================
// ITEMS OPERATIONS
// =============================================

export async function getItems(userId: string, categoryId?: string) {
  let query = supabase
    .from('items')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Item[];
}

export async function getItem(itemId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories(*)')
    .eq('id', itemId)
    .single();

  if (error) throw error;
  return data as Item;
}

export async function createItem(item: {
  user_id: string;
  title: string;
  content?: string;
  url?: string;
  summary?: string;
  item_type: ItemType;
  category_id?: string;
  ai_tags?: string[];
  ai_processed?: boolean;
}) {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data as Item;
}

export async function updateItem(
  itemId: string,
  updates: Partial<{
    title: string;
    content: string;
    url: string;
    summary: string;
    category_id: string | null;
    status: ItemStatus;
    is_favorite: boolean;
    ai_tags: string[];
  }>
) {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', itemId)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data as Item;
}

export async function deleteItem(itemId: string) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function toggleItemStatus(itemId: string, currentStatus: ItemStatus) {
  const newStatus: ItemStatus = currentStatus === 'unread' ? 'read' : 'unread';
  return updateItem(itemId, { status: newStatus });
}

export async function archiveItem(itemId: string) {
  return updateItem(itemId, { status: 'archived' });
}

export async function moveToCategory(itemId: string, categoryId: string | null) {
  return updateItem(itemId, { category_id: categoryId });
}

// =============================================
// CATEGORIES OPERATIONS
// =============================================

export async function getCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function createCategory(category: {
  user_id: string;
  name: string;
  icon?: string;
  color?: string;
}) {
  // Get the max order_index
  const { data: existing } = await supabase
    .from('categories')
    .select('order_index')
    .eq('user_id', category.user_id)
    .order('order_index', { ascending: false })
    .limit(1);

  const orderIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

  const { data, error } = await supabase
    .from('categories')
    .insert({ ...category, order_index: orderIndex })
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<{
    name: string;
    icon: string;
    color: string;
    order_index: number;
  }>
) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(categoryId: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
}

// =============================================
// SEARCH OPERATIONS
// =============================================

export async function searchItems(userId: string, query: string) {
  if (!query.trim()) {
    return getItems(userId);
  }

  // Use the full-text search function
  const { data, error } = await supabase
    .rpc('search_items', {
      search_query: query,
      p_user_id: userId,
    });

  if (error) {
    // Fallback to simple ILIKE search if RPC fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('items')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (fallbackError) throw fallbackError;
    return fallbackData as Item[];
  }

  return data as Item[];
}

// =============================================
// STATISTICS
// =============================================

export async function getItemCounts(userId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('status, category_id')
    .eq('user_id', userId);

  if (error) throw error;

  const counts = {
    total: data.length,
    unread: data.filter((i) => i.status === 'unread').length,
    read: data.filter((i) => i.status === 'read').length,
    archived: data.filter((i) => i.status === 'archived').length,
    byCategory: {} as Record<string, number>,
  };

  data.forEach((item) => {
    if (item.category_id) {
      counts.byCategory[item.category_id] = (counts.byCategory[item.category_id] || 0) + 1;
    }
  });

  return counts;
}
