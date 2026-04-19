import { RealtimeChannel } from '@supabase/supabase-js';

import {
  loadChatMessages as loadChatMessagesFromContent,
  loadChatRooms as loadChatRoomsFromContent,
  sendChatMessage as sendChatMessageToContent,
} from './content';
import { supabase } from './supabase';
import { ChatMessage, ChatRoom, UserProfile } from './types';

let chatChannels: Map<string, RealtimeChannel> = new Map();

function normalizeChatMessage(raw: any, currentUserId?: string): ChatMessage {
  return {
    id: String(raw.id),
    roomId: String(raw.roomId ?? raw.room_id ?? ''),
    senderId: raw.senderId ?? raw.sender_id ?? undefined,
    senderName: String(raw.senderName ?? raw.sender_name ?? 'Campus User'),
    senderRole: raw.senderRole ?? raw.sender_role ?? 'student',
    message: String(raw.message ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    isMine: currentUserId ? String(raw.senderId ?? raw.sender_id ?? '') === currentUserId : raw.isMine,
    isRead: typeof raw.isRead === 'boolean' ? raw.isRead : undefined,
  };
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const rooms = await loadChatRoomsFromContent();
  return rooms;
}

export async function getChatMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
  const messages = await loadChatMessagesFromContent(roomId);
  return messages.slice(offset, offset + limit).map((message) => ({
    ...message,
    createdAt: message.createdAt,
  }));
}

export async function sendChatMessage(
  roomId: string,
  message: string,
  profile: UserProfile
): Promise<ChatMessage | null> {
  const entry = await sendChatMessageToContent({
    roomId,
    senderName: profile.fullName,
    senderRole: profile.role === 'lecturer' ? 'lecturer' : profile.role === 'admin' ? 'admin' : 'student',
    message,
  });

  return entry ? normalizeChatMessage(entry, profile.id) : null;
}

export function subscribeToMessages(
  roomId: string,
  onNewMessage: (message: ChatMessage) => void
): () => void {
  if (!supabase) {
    return () => {};
  }

  const existingChannel = chatChannels.get(roomId);
  if (existingChannel) {
    supabase.removeChannel(existingChannel);
    chatChannels.delete(roomId);
  }

  const channel = supabase
    .channel(`chat:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onNewMessage(normalizeChatMessage(payload.new));
      }
    )
    .subscribe();

  chatChannels.set(roomId, channel);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
      chatChannels.delete(roomId);
    }
  };
}

export function cleanupChatSubscriptions() {
  const client = supabase;
  if (!client) {
    return;
  }

  chatChannels.forEach((channel) => {
    client.removeChannel(channel);
  });

  chatChannels.clear();
}
