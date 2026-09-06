export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

const CONVERSATIONS_KEY = 'chatweb-conversations';
const MESSAGES_KEY_PREFIX = 'chatweb-messages-';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CONVERSATIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function createConversation(title?: string): Conversation {
  const conv: Conversation = {
    id: generateId(),
    title: title || 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = getConversations();
  all.unshift(conv);
  saveConversations(all);
  return conv;
}

export function updateConversationTitle(id: string, title: string) {
  const all = getConversations();
  const conv = all.find((c) => c.id === id);
  if (conv) {
    conv.title = title;
    conv.updatedAt = Date.now();
    saveConversations(all);
  }
}

export function deleteConversation(id: string) {
  const all = getConversations().filter((c) => c.id !== id);
  saveConversations(all);
  localStorage.removeItem(MESSAGES_KEY_PREFIX + id);
}

export function getMessages(conversationId: string): unknown[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MESSAGES_KEY_PREFIX + conversationId);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMessages(conversationId: string, messages: unknown[]) {
  localStorage.setItem(
    MESSAGES_KEY_PREFIX + conversationId,
    JSON.stringify(messages)
  );
}
