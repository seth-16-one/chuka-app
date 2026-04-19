import { readCache, writeCache } from './cache';
import { demoAnnouncements, demoChatRooms, demoMessages, demoNotes, demoTimetable } from './mock-data';
import { isSupabaseReady, supabase } from './supabase';
import { AnnouncementItem, ChatMessage, ChatRoom, NoteItem, TimetableEntry } from './types';

const chatRoomsKey = 'chuka:chat:rooms';
const timetableKey = 'chuka:timetable';
const announcementsKey = 'chuka:announcements';
const notesKey = 'chuka:notes';

function mapChatRoomRow(row: any): ChatRoom {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    courseCode: row.course_code ?? row.courseCode ?? undefined,
    lastMessage: row.last_message ?? row.lastMessage ?? undefined,
    lastMessageAt: row.last_message_at ?? row.lastMessageAt ?? undefined,
    unreadCount: row.unread_count ?? row.unreadCount ?? 0,
    isOnline: Boolean(row.is_online ?? row.isOnline ?? false),
    isTyping: Boolean(row.is_typing ?? row.isTyping ?? false),
    lastSeen: row.last_seen ?? row.lastSeen ?? undefined,
  };
}

function mapChatMessageRow(row: any): ChatMessage {
  return {
    id: row.id,
    roomId: row.room_id ?? row.roomId,
    senderName: row.sender_name ?? row.senderName ?? 'Campus User',
    senderRole: (row.sender_role ?? row.senderRole ?? 'student') as ChatMessage['senderRole'],
    message: row.message,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMine: Boolean(row.isMine),
    isRead: Boolean(row.is_read ?? row.isRead ?? row.isMine),
  };
}

function mapTimetableRow(row: any): TimetableEntry {
  return {
    id: row.id,
    day: row.day,
    time: row.time,
    title: row.title,
    venue: row.venue,
    courseCode: row.course_code ?? row.courseCode,
    lecturer: row.lecturer,
    status: (row.status ?? 'upcoming') as TimetableEntry['status'],
  };
}

function mapAnnouncementRow(row: any): AnnouncementItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    audience: row.audience,
    publishedAt: row.published_at ?? row.publishedAt ?? new Date().toLocaleDateString(),
    author: row.author,
    priority: (row.priority ?? 'normal') as AnnouncementItem['priority'],
  };
}

function mapNoteRow(row: any): NoteItem {
  return {
    id: row.id,
    title: row.title,
    courseCode: row.course_code ?? row.courseCode,
    author: row.author,
    summary: row.summary,
    fileLabel: row.file_label ?? row.fileLabel,
    uploadedAt: row.uploaded_at ?? row.uploadedAt ?? new Date().toLocaleDateString(),
  };
}

export async function loadChatRooms() {
  if (!supabase || !isSupabaseReady) {
    return readCache(chatRoomsKey, demoChatRooms);
  }

  try {
    const { data } = await supabase.from('chat_rooms').select('*').order('updated_at', {
      ascending: false,
    });
    const rooms = (data ?? demoChatRooms).map(mapChatRoomRow);
    await writeCache(chatRoomsKey, rooms);
    return rooms;
  } catch {
    return readCache(chatRoomsKey, demoChatRooms);
  }
}

export async function loadChatMessages(roomId: string) {
  const fallback = demoMessages.filter((message) => message.roomId === roomId);

  if (!supabase || !isSupabaseReady) {
    return readCache(`chuka:chat:messages:${roomId}`, fallback);
  }

  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    const messages = (data ?? fallback).map(mapChatMessageRow);
    await writeCache(`chuka:chat:messages:${roomId}`, messages);
    return messages;
  } catch {
    return readCache(`chuka:chat:messages:${roomId}`, fallback);
  }
}

export async function sendChatMessage(payload: {
  roomId: string;
  senderName: string;
  senderRole: ChatMessage['senderRole'];
  message: string;
}) {
  const entry: ChatMessage = {
    id: `local-${Date.now()}`,
    roomId: payload.roomId,
    senderName: payload.senderName,
    senderRole: payload.senderRole,
    message: payload.message,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMine: true,
    isRead: false,
  };

  if (!supabase || !isSupabaseReady) {
    const previous = await loadChatMessages(payload.roomId);
    const next = [...previous, entry];
    await writeCache(`chuka:chat:messages:${payload.roomId}`, next);
    return entry;
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: payload.roomId,
      sender_name: payload.senderName,
      sender_role: payload.senderRole,
      message: payload.message,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data ? mapChatMessageRow(data) : entry;
}

export async function loadTimetable() {
  if (!supabase || !isSupabaseReady) {
    return readCache(timetableKey, demoTimetable);
  }

  try {
    const { data } = await supabase.from('timetable_entries').select('*').order('day_order', {
      ascending: true,
    });
    const timetable = (data ?? demoTimetable).map(mapTimetableRow);
    await writeCache(timetableKey, timetable);
    return timetable;
  } catch {
    return readCache(timetableKey, demoTimetable);
  }
}

export async function loadAnnouncements() {
  if (!supabase || !isSupabaseReady) {
    return readCache(announcementsKey, demoAnnouncements);
  }

  try {
    const { data } = await supabase.from('announcements').select('*').order('published_at', {
      ascending: false,
    });
    const announcements = (data ?? demoAnnouncements).map(mapAnnouncementRow);
    await writeCache(announcementsKey, announcements);
    return announcements;
  } catch {
    return readCache(announcementsKey, demoAnnouncements);
  }
}

export async function loadNotes() {
  if (!supabase || !isSupabaseReady) {
    return readCache(notesKey, demoNotes);
  }

  try {
    const { data } = await supabase.from('notes').select('*').order('uploaded_at', {
      ascending: false,
    });
    const notes = (data ?? demoNotes).map(mapNoteRow);
    await writeCache(notesKey, notes);
    return notes;
  } catch {
    return readCache(notesKey, demoNotes);
  }
}
