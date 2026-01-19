# 📦 Message APIs & Hooks - Quick Reference

## ✅ Đã tạo xong

### 📁 API Functions (src/features/chat/api/)
- ✅ `createMessage.ts` - Tạo message mới
- ✅ `getAllMessages.ts` - Lấy tất cả messages
- ✅ `getMessagesByRoomId.ts` - Lấy messages theo roomId
- ✅ `deleteMessage.ts` - Xóa 1 message
- ✅ `deleteMessagesByRoomId.ts` - Xóa tất cả messages của room
- ✅ `updateMessageStatus.ts` - Cập nhật status (sent/delivered/read/failed)
- ✅ `getUnreadCount.ts` - Đếm số message chưa đọc
- ✅ `getLastMessage.ts` - Lấy message cuối cùng của room

### 🎣 React Query Hooks (src/features/chat/hooks/)
- ✅ `useCreateMessage.ts` - Hook tạo message
- ✅ `useGetAllMessages.ts` - Hook lấy tất cả messages
- ✅ `useGetMessagesByRoomId.ts` - Hook lấy messages theo roomId
- ✅ `useDeleteMessage.ts` - Hook xóa message
- ✅ `useDeleteMessagesByRoomId.ts` - Hook xóa messages theo roomId
- ✅ `useUpdateMessageStatus.ts` - Hook update status
- ✅ `useGetUnreadCount.ts` - Hook đếm unread (auto-refetch 5s)

### 📱 Example Components
- ✅ `MessageListExample.tsx` - Demo đầy đủ các hooks
- ✅ `ChatScreen.tsx` - Real-world chat screen example

### 📚 Documentation
- ✅ `MESSAGE_API_DOCS.md` - Docs đầy đủ với examples

## 🚀 Quick Start

### 1. Tạo message mới

```typescript
import { useCreateMessage } from '@/features/chat/hooks';

const { mutate: sendMessage } = useCreateMessage();

sendMessage({
  type: 'text',
  message: 'Hello!',
  roomId: 'room-123',
  created_by: 'user-456',
  status: 'sent',
});
```

### 2. Hiển thị messages của room

```typescript
import { useGetMessagesByRoomId } from '@/features/chat/hooks';

const { data: messages, isLoading } = useGetMessagesByRoomId('room-123');
```

### 3. Xóa message

```typescript
import { useDeleteMessage } from '@/features/chat/hooks';

const { mutate: deleteMsg } = useDeleteMessage();

deleteMsg('message-id');
```

### 4. Update status

```typescript
import { useUpdateMessageStatus } from '@/features/chat/hooks';

const { mutate: updateStatus } = useUpdateMessageStatus();

updateStatus({ 
  messageId: 'msg-123', 
  status: 'read' 
});
```

### 5. Xem số unread messages

```typescript
import { useGetUnreadCount } from '@/features/chat/hooks';

const { data: unreadCount } = useGetUnreadCount('room-123', 'user-456');
```

## 🎯 Features

✅ **TypeScript** - Full type safety
✅ **React Query** - Auto-caching & refetching
✅ **Auto-invalidation** - Cache tự động update
✅ **Error handling** - Built-in error management
✅ **Loading states** - isPending, isLoading
✅ **Optimistic updates** - Ready for implementation
✅ **Real-time ready** - Easy to integrate WebSocket

## 📖 Đọc docs chi tiết

Xem file: `src/features/chat/MESSAGE_API_DOCS.md`

## 🔗 Import paths

```typescript
// Import tất cả hooks
import { 
  useCreateMessage,
  useGetMessagesByRoomId,
  useDeleteMessage,
  useUpdateMessageStatus,
  useGetUnreadCount
} from '@/features/chat/hooks';

// Import tất cả API functions
import {
  createMessage,
  getAllMessages,
  deleteMessage
} from '@/features/chat/api';
```

## ⚠️ Lưu ý

1. Database phải được initialize trước: `await ensureDatabase()`
2. Cần có QueryClientProvider ở root app
3. Message type: 'text' | 'image' | 'file' | custom
4. Status: 'sent' | 'delivered' | 'read' | 'failed'

## 🎨 Example Screens

Xem 2 example components:
- `ChatScreen.tsx` - Full chat UI với send/receive
- `MessageListExample.tsx` - Simple demo với CRUD operations
