// =============================================
// n8n Webhook Integration Service
// =============================================

import type {
  ProcessItemRequest,
  ProcessItemResponse,
  AddToCalendarRequest,
  AddToCalendarResponse,
} from '../types';

const N8N_PROCESS_ITEM_URL = import.meta.env.VITE_N8N_PROCESS_ITEM_URL;
const N8N_ADD_TO_CALENDAR_URL = import.meta.env.VITE_N8N_ADD_TO_CALENDAR_URL;

/**
 * Process a new item through n8n AI workflow
 * - Extracts title from URL or generates one
 * - Creates AI summary
 * - Suggests category and tags
 */
export async function processNewItem(
  request: ProcessItemRequest
): Promise<ProcessItemResponse> {
  if (!N8N_PROCESS_ITEM_URL) {
    throw new Error('n8n process item webhook URL not configured');
  }

  try {
    const response = await fetch(N8N_PROCESS_ITEM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const data = await response.json();
    return data as ProcessItemResponse;
  } catch (error) {
    console.error('Error processing item with n8n:', error);
    throw error;
  }
}

/**
 * Add an item to Google Calendar via n8n
 */
export async function addToCalendar(
  request: AddToCalendarRequest
): Promise<AddToCalendarResponse> {
  if (!N8N_ADD_TO_CALENDAR_URL) {
    throw new Error('n8n calendar webhook URL not configured');
  }

  try {
    const response = await fetch(N8N_ADD_TO_CALENDAR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const data = await response.json();
    return data as AddToCalendarResponse;
  } catch (error) {
    console.error('Error adding to calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Utility to detect if input is a URL
 */
export function isUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Utility to extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}
