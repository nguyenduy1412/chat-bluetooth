# Message API & Hooks Documentation

## 📁 Cấu trúc

```
src/features/chat/
├── api/
│   ├── createMessage.ts              # Tạo message mới
│   ├── getAllMessages.ts             # Lấy tất cả messages
│   ├── getMessagesByRoomId.ts        # Lấy messages theo roomId
│   ├── deleteMessage.ts              # Xóa 1 message
│   ├── deleteMessagesByRoomId.ts     # Xóa tất cả messages của room
│   └── index.ts
├── hooks/
│   ├── useCreateMessage.ts           # Hook tạo message
│   ├── useGetAllMessages.ts          # Hook lấy tất cả messages
│   ├── useGetMessagesByRoomId.ts     # Hook lấy messages theo roomId
│   ├── useDeleteMessage.ts           # Hook xóa message
│   ├── useDeleteMessagesByRoomId.ts  # Hook xóa messages theo roomId
│   └── index.ts
└── components/
    └── MessageListExample.tsx        # Component demo
```

## 🚀 API Functions

### 1. Create Message

```typescript
import { createMessage } from '@/features/chat/api';

const newMessage = await createMessage({
  type: 'text',           // 'text', 'image', 'file', etc.
  message: 'Hello!',
  roomId: 'room-id',
  created_by: 'user-id',
  status: 'sent'          // optional: 'sent', 'delivered', 'read', 'failed'
});
```

### 2. Get All Messages

```typescript
import { getAllMessages } from '@/features/chat/api';

const messages = await getAllMessages();
```

### 3. Get Messages by Room ID

```typescript
import { getMessagesByRoomId } from '@/features/chat/api';

const roomMessages = await getMessagesByRoomId('room-id');
```

### 4. Delete Message

```typescript
import { deleteMessage } from '@/features/chat/api';

const success = await deleteMessage('message-id');
```

### 5. Delete Messages by Room ID

```typescript
import { deleteMessagesByRoomId } from '@/features/chat/api';

const success = await deleteMessagesByRoomId('room-id');
```

## 🎣 React Query Hooks

### useCreateMessage

```typescript
import { useCreateMessage } from '@/features/chat/hooks';

function ChatInput({ roomId, userId }) {
  const { mutate: createMessage, isPending } = useCreateMessage();

  const handleSend = (text: string) => {
    createMessage({
      type: 'text',
      message: text,
      roomId: roomId,
      created_by: userId,
      status: 'sent',
    }, {
      onSuccess: (data) => {
        console.log('Message created:', data);
      },
      onError: (error) => {
        console.error('Error:', error);
      },
    });
  };

  return <Button title="Send" onPress={() => handleSend('Hello')} disabled={isPending} />;
}
```

### useGetMessagesByRoomId

```typescript
import { useGetMessagesByRoomId } from '@/features/chat/hooks';

function MessageList({ roomId }) {
  const { data: messages, isLoading, error, refetch } = useGetMessagesByRoomId(roomId);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem message={item} />}
    />
  );
}
```

### useGetAllMessages

```typescript
import { useGetAllMessages } from '@/features/chat/hooks';

function AllMessages() {
  const { data: messages, isLoading } = useGetAllMessages();

  return (
    <View>
      <Text>Total Messages: {messages?.length || 0}</Text>
    </View>
  );
}
```

### useDeleteMessage

```typescript
import { useDeleteMessage } from '@/features/chat/hooks';

function MessageActions({ messageId }) {
  const { mutate: deleteMessage, isPending } = useDeleteMessage();

  const handleDelete = () => {
    deleteMessage(messageId, {
      onSuccess: () => {
        console.log('Message deleted');
      },
    });
  };

  return <Button title="Delete" onPress={handleDelete} disabled={isPending} />;
}
```

### useDeleteMessagesByRoomId

```typescript
import { useDeleteMessagesByRoomId } from '@/features/chat/hooks';

function ClearChatButton({ roomId }) {
  const { mutate: clearChat, isPending } = useDeleteMessagesByRoomId();

  const handleClear = () => {
    clearChat(roomId, {
      onSuccess: () => {
        console.log('All messages deleted');
      },
    });
  };

  return <Button title="Clear Chat" onPress={handleClear} disabled={isPending} />;
}
```

## 🔄 Auto-refetch & Caching

Các hooks tự động invalidate cache khi có thay đổi:

- **useCreateMessage**: Invalidate `['messages']` và `['messages', roomId]`
- **useDeleteMessage**: Invalidate `['messages']` và `['rooms']`
- **useDeleteMessagesByRoomId**: Invalidate `['messages', roomId]`, `['messages']`, và `['rooms']`

## 📝 Message Entity

```typescript
interface Message {
  id: string;
  type: string;                    // text, image, file, etc.
  message: string;
  status?: string;                 // sent, delivered, read, failed
  roomId: string;
  created_by: string;
  created_at: Date;
  room: Room;                      // Relation
  createdBy: User;                 // Relation
}
```

## 💡 Best Practices

1. **Luôn check database đã init:**
   ```typescript
   await ensureDatabase();
   ```

2. **Handle errors:**
   ```typescript
   const { mutate } = useCreateMessage();
   
   mutate(data, {
     onError: (error) => {
       console.error('Failed:', error);
       // Show error toast
     },
   });
   ```

3. **Optimistic updates:**
   ```typescript
   const queryClient = useQueryClient();
   
   mutate(newMessage, {
     onMutate: async (newMsg) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
       
       // Snapshot previous value
       const previousMessages = queryClient.getQueryData(['messages', roomId]);
       
       // Optimistically update
       queryClient.setQueryData(['messages', roomId], (old) => [...old, newMsg]);
       
       return { previousMessages };
     },
     onError: (err, newMsg, context) => {
       // Rollback on error
       queryClient.setQueryData(['messages', roomId], context.previousMessages);
     },
   });
   ```

## 🎯 Complete Example

Xem file `MessageListExample.tsx` để thấy ví dụ đầy đủ về cách sử dụng tất cả hooks.

## 🔗 Related

- Room API & Hooks: `src/features/chat/api/createRoom.ts`
- User API & Hooks: `src/features/auth/`
- Database Setup: `DATABASE_SETUP.md`
