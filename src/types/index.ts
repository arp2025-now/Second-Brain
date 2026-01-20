// =============================================
// Type Definitions for Second Brain
// =============================================

export type ItemType = 'link' | 'note' | 'idea';
export type ItemStatus = 'unread' | 'read' | 'archived';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_system: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  content: string | null;
  url: string | null;
  summary: string | null;
  item_type: ItemType;
  status: ItemStatus;
  is_favorite: boolean;
  ai_processed: boolean;
  ai_tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// n8n API types
export interface ProcessItemRequest {
  input: string;
  userId: string;
}

export interface ProcessItemResponse {
  title: string;
  summary: string;
  category: string;
  item_type: ItemType;
  tags: string[];
  url?: string;
}

export interface AddToCalendarRequest {
  itemId: string;
  title: string;
  description: string;
  userId: string;
}

export interface AddToCalendarResponse {
  success: boolean;
  eventId?: string;
  eventUrl?: string;
  error?: string;
}

// UI State types
export interface QuickCaptureInput {
  value: string;
  isProcessing: boolean;
}

export interface SearchState {
  query: string;
  results: Item[];
  isSearching: boolean;
}
