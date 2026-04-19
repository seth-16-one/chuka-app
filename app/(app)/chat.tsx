import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageBubble } from '@/components/ui/message-bubble';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  cleanupChatSubscriptions,
  getChatMessages,
  getChatRooms,
  sendChatMessage,
  subscribeToMessages,
} from '../../services/chat';
import { ChatMessage, ChatRoom } from '@/services/types';
import { useAuthStore } from '@/store/auth-store';

type ChatTab = 'chats' | 'groups';

function initials(label: string) {
  return label
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function roomStatus(room: ChatRoom) {
  if (room.isTyping) return 'Typing...';
  if (room.isOnline) return 'Online';
  return room.lastSeen ?? room.lastMessageAt ?? 'Offline';
}

function roomTypeLabel(room: ChatRoom) {
  if (room.type === 'group') return 'Group';
  if (room.type === 'class') return 'Class';
  return 'Chat';
}

function sortMessages(items: ChatMessage[]) {
  return [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export default function ChatScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<ChatTab>('chats');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageReloadTick, setMessageReloadTick] = useState(0);

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  const normalizedQuery = query.trim().toLowerCase();
  const currentUserId = profile?.id ?? '';

  function openCall(mode: 'video' | 'audio') {
    if (!activeRoom) {
      return;
    }

    router.push(
      `/call?roomId=${encodeURIComponent(activeRoom.id)}&roomName=${encodeURIComponent(activeRoom.name)}&mode=${mode}` as never
    );
  }

  const directRooms = useMemo(() => rooms.filter((room) => room.type !== 'group'), [rooms]);
  const groupRooms = useMemo(() => rooms.filter((room) => room.type === 'group'), [rooms]);

  const visibleRooms = useMemo(() => {
    const source = tab === 'groups' ? groupRooms : directRooms;
    if (!normalizedQuery) {
      return source;
    }

    return source.filter((room) => {
      return (
        room.name.toLowerCase().includes(normalizedQuery) ||
        (room.lastMessage || '').toLowerCase().includes(normalizedQuery) ||
        (room.courseCode || '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [directRooms, groupRooms, normalizedQuery, tab]);

  const activeRoom = useMemo(
    () => visibleRooms.find((room) => room.id === activeRoomId) ?? visibleRooms[0],
    [activeRoomId, visibleRooms]
  );

  const scrollToLatest = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const normalizeMessage = useCallback(
    (message: ChatMessage): ChatMessage => {
      return {
        ...message,
        isMine: Boolean(currentUserId) && message.senderId === currentUserId,
      };
    },
    [currentUserId]
  );

  const replaceMessages = useCallback(
    (nextMessages: ChatMessage[]) => {
      const uniqueIds = new Set<string>();
      const normalized = sortMessages(
        nextMessages
          .map((item) => normalizeMessage(item))
          .filter((item) => {
            if (uniqueIds.has(item.id)) {
              return false;
            }
            uniqueIds.add(item.id);
            return true;
          })
      );

      messageIdsRef.current = uniqueIds;
      setMessages(normalized);
    },
    [normalizeMessage]
  );

  const appendMessage = useCallback(
    (nextMessage: ChatMessage) => {
      const normalized = normalizeMessage(nextMessage);

      setMessages((current) => {
        if (messageIdsRef.current.has(normalized.id)) {
          return current;
        }

        messageIdsRef.current.add(normalized.id);
        return sortMessages([...current, normalized]);
      });

      scrollToLatest();
    },
    [normalizeMessage, scrollToLatest]
  );

  useEffect(() => {
    let mounted = true;

    setLoadingRooms(true);
    getChatRooms()
      .then((items) => {
        if (!mounted) {
          return;
        }

        setRooms(items);
        setActiveRoomId((current) => current || items[0]?.id || '');
      })
      .catch((error) => {
        if (mounted) {
          Alert.alert('Chats unavailable', error instanceof Error ? error.message : 'Try again later.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingRooms(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!visibleRooms.length) {
      return;
    }

    if (!visibleRooms.some((room) => room.id === activeRoomId)) {
      setActiveRoomId(visibleRooms[0].id);
    }
  }, [activeRoomId, visibleRooms]);

  useEffect(() => {
    if (!activeRoomId) {
      messageIdsRef.current = new Set();
      setMessages([]);
      setMessageError(null);
      setLoadingMessages(false);
      return;
    }

    let mounted = true;
    setLoadingMessages(true);
    setMessageError(null);
    messageIdsRef.current = new Set();
    setMessages([]);

    getChatMessages(activeRoomId)
      .then((items) => {
        if (!mounted) {
          return;
        }

        replaceMessages(items);
        scrollToLatest(false);
      })
      .catch((error) => {
        if (mounted) {
          setMessageError(error instanceof Error ? error.message : 'Unable to load messages.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingMessages(false);
        }
      });

    const unsubscribe = subscribeToMessages(activeRoomId, (newMessage) => {
      if (!mounted) {
        return;
      }

      appendMessage(newMessage);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [activeRoomId, currentUserId, messageReloadTick, appendMessage, replaceMessages, scrollToLatest]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToLatest();
    }
  }, [messages.length, scrollToLatest]);

  useEffect(() => {
    return () => {
      cleanupChatSubscriptions();
    };
  }, []);

  async function handleSend() {
    if (!activeRoom || !draft.trim() || !profile) {
      return;
    }

    const outgoingMessage = draft.trim();
    try {
      setSending(true);
      const sentMessage = await sendChatMessage(activeRoom.id, outgoingMessage, profile);
      setDraft('');
      if (sentMessage) {
        appendMessage(sentMessage);
      }
    } catch (error) {
      Alert.alert('Message not sent', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen scroll={false} contentClassName="px-4 pt-4 pb-4">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">
              Campus communication
            </Text>
            <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Messages and groups</Text>
            <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
              Formal conversations, class groups, and quick call access in one workspace.
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/12">
              <MaterialCommunityIcons name="magnify" size={22} color="#ffffff" />
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/12">
              <MaterialCommunityIcons name="dots-vertical" size={22} color="#ffffff" />
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row rounded-full bg-black/15 p-1">
          <Pressable
            onPress={() => setTab('chats')}
            className={`flex-1 rounded-full px-4 py-3 ${tab === 'chats' ? 'bg-white/20' : ''}`}>
            <Text className="text-center text-sm font-bold text-white">Chats</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('groups')}
            className={`flex-1 rounded-full px-4 py-3 ${tab === 'groups' ? 'bg-white/20' : ''}`}>
            <Text className="text-center text-sm font-bold text-white">Groups</Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-[24px] bg-white/12 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="magnify" size={20} color="#d5e5e3" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={tab === 'groups' ? 'Search groups' : 'Search conversations'}
              placeholderTextColor="#bfd0cb"
              className="flex-1 text-base text-white"
              style={{ paddingVertical: 0 }}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#ffffff" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <View className="mt-4">
        {loadingRooms ? (
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm">
            Loading conversations...
          </Text>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={visibleRooms}
        keyExtractor={(item) => item.id}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
        renderItem={({ item: room }) => {
          const active = room.id === activeRoomId;
          const status = roomStatus(room);

          return (
            <Pressable onPress={() => setActiveRoomId(room.id)} style={{ marginRight: 12 }}>
              <Card style={{ width: 170 }} className={active ? 'border-chuka-800 bg-chuka-50' : ''}>
                <View className="flex-row items-start gap-3">
                  <View
                    style={{
                      backgroundColor: active ? '#006400' : isDark ? '#17311f' : '#eef7ef',
                    }}
                    className="h-12 w-12 items-center justify-center rounded-full">
                    <Text
                      style={{ color: active ? '#ffffff' : isDark ? '#a9dcaa' : '#006400' }}
                      className="text-sm font-bold">
                      {initials(room.name)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between gap-2">
                      <Text
                        style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
                        className="flex-1 text-sm font-bold">
                        {room.name}
                      </Text>
                      {room.unreadCount ? (
                        <View className="min-h-5 min-w-5 items-center justify-center rounded-full bg-chuka-800 px-1">
                          <Text className="text-[10px] font-bold text-white">{room.unreadCount}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="mt-1 flex-row items-center gap-2">
                      <View
                        style={{
                          backgroundColor: room.isOnline ? '#1e7a1e' : '#8fa394',
                        }}
                        className="h-2 w-2 rounded-full"
                      />
                      <Text
                        style={{ color: room.isTyping ? '#1e7a1e' : isDark ? '#d8e6db' : '#4f6655' }}
                        className="text-[11px] font-semibold">
                        {status}
                      </Text>
                    </View>
                    <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-xs leading-4">
                      {room.lastMessage?.slice(0, 42) ?? 'No recent message'}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1">
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
            {tab === 'groups' ? 'Group chats' : 'Personal chats'}
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-5">
            {tab === 'groups'
              ? 'Department and class groups are shown in a formal list.'
              : 'Direct and class conversations are shown in a formal list.'}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Badge label={tab === 'groups' ? `${groupRooms.length} groups` : `${directRooms.length} chats`} tone="gray" />
        </View>
      </View>

      {activeRoom ? (
        <View
          style={{
            backgroundColor: isDark ? '#0d1b11' : '#ffffff',
            borderColor: isDark ? '#1f3b27' : '#d7e6d7',
          }}
          className="mt-4 mb-4 rounded-[28px] border px-4 py-4 shadow-soft">
          <View className="flex-row items-center justify-between">
            <View className="flex-row flex-1 items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-chuka-800">
                <Text className="text-sm font-bold text-white">{initials(activeRoom.name)}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                  {activeRoom.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <View
                    style={{
                      backgroundColor: activeRoom.isOnline ? '#1e7a1e' : '#8fa394',
                    }}
                    className="h-2.5 w-2.5 rounded-full"
                  />
                  <Text
                    style={{ color: activeRoom.isTyping ? '#1e7a1e' : isDark ? '#d8e6db' : '#4f6655' }}
                    className="text-xs font-semibold">
                    {roomTypeLabel(activeRoom)} • {roomStatus(activeRoom)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                style={{
                  backgroundColor: isDark ? '#17311f' : '#eef7ef',
                  borderColor: isDark ? '#1f3b27' : '#d7e6d7',
                }}
                onPress={() => openCall('video')}
                className="h-10 w-10 items-center justify-center rounded-full border">
                <MaterialCommunityIcons name="video-outline" size={18} color={isDark ? '#a9dcaa' : '#006400'} />
              </Pressable>
              <Pressable
                style={{
                  backgroundColor: isDark ? '#17311f' : '#eef7ef',
                  borderColor: isDark ? '#1f3b27' : '#d7e6d7',
                }}
                onPress={() => openCall('audio')}
                className="h-10 w-10 items-center justify-center rounded-full border">
                <MaterialCommunityIcons name="phone-outline" size={18} color={isDark ? '#a9dcaa' : '#006400'} />
              </Pressable>
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Tag label={roomTypeLabel(activeRoom).toLowerCase()} active />
            <Text
              style={{ color: isDark ? '#d8e6db' : '#4f6655' }}
              className="text-xs font-semibold uppercase tracking-[0.18em]">
              Active now
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={{
          backgroundColor: isDark ? '#0d1b11' : '#ffffff',
          borderColor: isDark ? '#1f3b27' : '#d7e6d7',
        }}
        className="flex-1 overflow-hidden rounded-[32px] border">
        <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-3">
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-sm font-bold uppercase tracking-[0.22em]">
            Today
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs">
            {messages.length} messages
          </Text>
        </View>

        {messageError ? (
          <View className="px-4 pt-4">
            <EmptyState
              title="Chat unavailable"
              description={messageError}
              actionTitle="Retry"
              onAction={() => {
                setMessageError(null);
                setMessageReloadTick((value) => value + 1);
              }}
            />
          </View>
        ) : null}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListEmptyComponent={
            loadingMessages ? (
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="px-2 text-sm">
                Loading chat history...
              </Text>
            ) : (
              <EmptyState title="No messages yet" description="Start the conversation for this room." />
            )
          }
          onContentSizeChange={() => {
            scrollToLatest(false);
          }}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            style={{
              backgroundColor: isDark ? '#0d1b11' : '#ffffff',
              borderTopColor: isDark ? '#1f3b27' : '#d7e6d7',
            }}
            className="border-t px-3 py-3">
            <View className="flex-row items-end gap-2">
              <View
                style={{
                  backgroundColor: isDark ? '#17311f' : '#f4f8f4',
                  borderColor: isDark ? '#1f3b27' : '#d7e6d7',
                }}
                className="h-12 w-12 items-center justify-center rounded-full border">
                <MaterialCommunityIcons name="emoticon-outline" size={22} color={isDark ? '#a9dcaa' : '#006400'} />
              </View>

              <View className="flex-1">
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Write a message..."
                  placeholderTextColor={isDark ? '#9fb4a5' : '#7d8f83'}
                  className="min-h-12 rounded-[28px] border px-4 py-3 text-base"
                  style={{
                    backgroundColor: isDark ? '#0d1b11' : '#ffffff',
                    borderColor: isDark ? '#1f3b27' : '#d7e6d7',
                    color: isDark ? '#ffffff' : '#1A1A1A',
                  }}
                  multiline
                />
              </View>

              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    backgroundColor: isDark ? '#17311f' : '#f4f8f4',
                    borderColor: isDark ? '#1f3b27' : '#d7e6d7',
                  }}
                  className="h-12 w-12 items-center justify-center rounded-full border">
                  <MaterialCommunityIcons name="paperclip" size={20} color={isDark ? '#a9dcaa' : '#006400'} />
                </View>
                <Pressable
                  onPress={handleSend}
                  disabled={sending || !draft.trim()}
                  style={{
                    backgroundColor: sending || !draft.trim() ? '#8aa58a' : '#006400',
                  }}
                  className="h-12 w-12 items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name={sending ? 'progress-clock' : 'send'}
                    size={20}
                    color="#ffffff"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Screen>
  );
}
