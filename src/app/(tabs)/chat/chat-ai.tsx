import {ActivityIndicator, StatusBar, Alert} from 'react-native';
import React, {useCallback, useEffect, useState, useMemo, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Message, MessageRole} from 'react-native-executorch';
import {CustomChatView} from '../../../features/chat/components/CustomChatView';
import {Box} from '../../../components/common/Layout/Box';
import {ArrowLeft} from 'lucide-react-native';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import {goBack} from '../../../utils/navigationUtils';
import useModelStore from '../../../store/modelStore';
import {useLLMContext} from '../../../components/provider/LLMProvider';
import {userStore} from '@/store/userStore';
import {MessageEntity} from '@/database/entities/MessageEntity';
import {useCreateMessage} from '@/features/chat/hooks/useCreateMessage';
import {useGetMessagesByRoomId} from '@/features/chat/hooks/useGetMessagesByRoomId';
import {useDeleteMessage} from '@/features/chat/hooks/useDeleteMessage';
import {v4} from 'uuid';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootNavigatorParamList} from '@/types/navigation-type';
import HeaderChat from '@/features/chat/components/HeaderChat';
import SearchBar from '@/features/chat/components/SearchBar';

const ChatAIScreen = () => {
  const insets = useSafeAreaInsets();
  const {activeModel} = useModelStore();
  const llm = useLLMContext();
  const {user} = userStore();
  const route = useRoute<RouteProp<RootNavigatorParamList, 'ChatAIScreen'>>();
  const {data: dbMessages, isLoading} = useGetMessagesByRoomId(
    route?.params?.roomId,
  );
  const {mutateAsync: createMessage} = useCreateMessage();
  const {mutateAsync: deleteMessage} = useDeleteMessage();

  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] =
    useState<MessageEntity | null>(null);
  const currentAiMessageIdRef = useRef<string | null>(null);

  const [isTyping, setIsTyping] = useState(false);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  useEffect(() => {
    if (dbMessages && dbMessages.length > 0) {
      setMessages(dbMessages);
    }
  }, [isLoading]);

  useEffect(() => {
    const shouldBeTyping = isGenerating && !streamingMessage;
    setIsTyping(prev => (prev !== shouldBeTyping ? shouldBeTyping : prev));
  }, [isGenerating, streamingMessage]);

  // Search logic
  useEffect(() => {
    if (searchText.trim().length === 0) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results: string[] = [];
    const searchLower = searchText.toLowerCase();

    messages.forEach(msg => {
      if (msg.message && msg.message.toLowerCase().includes(searchLower)) {
        results.push(msg.id);
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);
  }, [searchText, messages]);
  useEffect(() => {
    if (llm.response && isGenerating && currentAiMessageIdRef.current) {
      setStreamingMessage({
        id: currentAiMessageIdRef.current,
        message: llm.response,
        createdAt: new Date(),
        created_by: route.params?.receiver?.id,
        roomId: route.params?.roomId,
        type: 'text',
        status: 'sent',
      });
    }
  }, [llm.response, isGenerating]);

  useEffect(() => {
    const saveAiResponse = async () => {
      if (!llm.isGenerating && isGenerating && streamingMessage) {
        try {
          await createMessage(streamingMessage);
          setMessages(prev => [streamingMessage, ...prev]);
        } catch (error) {
          console.error('Failed to save AI response:', error);
        } finally {
          setStreamingMessage(null);
          currentAiMessageIdRef.current = null;
          setIsGenerating(false);
        }
      }
    };
    saveAiResponse();
  }, [llm.isGenerating, isGenerating, streamingMessage]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !llm.isReady || llm.isGenerating || !user?.id) {
        return;
      }

      const trimmedText = text.trim();

      try {
        const newMessage = {
          id: v4(),
          message: trimmedText,
          roomId: route.params?.roomId,
          created_by: user.id,
          type: 'text',
          status: 'sent',
          createdAt: new Date(),
        } as MessageEntity;
        console.log('newMessage', newMessage);
        await createMessage(newMessage);

        // Update messages state immediately
        setMessages(prev => [newMessage, ...prev]);

        currentAiMessageIdRef.current = v4();
        setIsGenerating(true);

        const MAX_CONTEXT_MESSAGES = 10;
        const recentMessages = messages.slice(0, MAX_CONTEXT_MESSAGES);

        // System prompt để AI trả lời thông minh và chuẩn hơn
        const systemPrompt = `Bạn là trợ lý AI thông minh và hữu ích. Hãy tuân thủ các nguyên tắc sau:
          - Trả lời tự nhiên, dễ hiểu
          - Câu trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin
          - Lịch sự, thân thiện và chuyên nghiệp
          - Nếu không biết, hãy thừa nhận thay vì bịa đặt
          - Sử dụng ví dụ cụ thể khi cần giải thích
          - Format câu trả lời rõ ràng, dễ đọc`;

        const conversationHistory: Message[] = [
          // Thêm system prompt vào đầu
          {
            role: 'user' as MessageRole,
            content: systemPrompt,
          },
          {
            role: 'assistant' as MessageRole,
            content: 'Tôi hiểu. Tôi sẽ trả lời theo các nguyên tắc đã nêu.',
          },
          // Thêm lịch sử chat gần đây
          ...[...recentMessages].reverse().map(msg => ({
            role: (msg.created_by === route.params?.receiver?.id
              ? 'assistant'
              : 'user') as MessageRole,
            content: msg.message || '',
          })),
          {
            role: 'user' as MessageRole,
            content: trimmedText,
          },
        ];

        console.log(
          `Using ${
            conversationHistory.length - 3
          } previous messages for context`,
        );

        llm.generate(conversationHistory).catch((error: any) => {
          console.error('AI generation failed:', error);
          setIsGenerating(false);
          setStreamingMessage(null);
          currentAiMessageIdRef.current = null;
        });
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    },
    [llm, user, createMessage, messages],
  );

  if (!llm.isReady) {
    return (
      <Box flex={1} backgroundColor={colors.white}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <Box flex={1} justifyContent="center" alignItems="center" px={20}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Box mt={16}>
            <Text fontSize={16} color={colors.text} fontWeight="semibold">
              Đang tải model AI...
            </Text>
          </Box>
          <Box mt={8}>
            <Text fontSize={14} color={colors.textSecondary}>
              {Math.round(llm.downloadProgress * 100)}%
            </Text>
          </Box>
          <Box mt={8}>
            <Text fontSize={12} color={colors.textSecondary} align="center">
              Model: {activeModel || 'LLAMA3_2_1B'}
            </Text>
          </Box>
          <Box mt={4}>
            <Text fontSize={12} color={colors.textSecondary} align="center">
              Chỉ cần tải một lần, sau đó dùng offline!
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  const handleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      // Close search
      setSearchText('');
      setSearchResults([]);
      setCurrentSearchIndex(0);
    }
  }, [showSearch]);

  const handleSearchPrevious = useCallback(() => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
    }
  }, [searchResults]);

  const handleSearchNext = useCallback(() => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
    }
  }, [searchResults]);

  const currentHighlightedMessageId = useMemo(() => {
    return searchResults.length > 0
      ? searchResults[currentSearchIndex]
      : undefined;
  }, [searchResults, currentSearchIndex]);

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      Alert.alert('Xóa tin nhắn', 'Bạn có chắc chắn muốn xóa tin nhắn này?', [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Xóa từ database
              await deleteMessage(messageId);
              // Xóa khỏi state local
              setMessages(prev => prev.filter(msg => msg.id !== messageId));
            } catch (error) {
              console.error('Failed to delete message:', error);
              Alert.alert('Lỗi', 'Không thể xóa tin nhắn');
            }
          },
        },
      ]);
    },
    [deleteMessage],
  );
  return (
    <Box flex={1} backgroundColor={colors.white}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <HeaderChat name="AI" onSearch={handleSearch} type="ai" />

      <SearchBar
        visible={showSearch}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onClose={handleSearch}
        currentIndex={currentSearchIndex}
        totalResults={searchResults.length}
        onPrevious={handleSearchPrevious}
        onNext={handleSearchNext}
      />

      <CustomChatView
        messages={streamingMessage ? [streamingMessage, ...messages] : messages}
        currentUserId={user?.id || 'me'}
        currentUserName={user?.name || 'Bạn'}
        onSend={handleSendMessage}
        placeholder="Hỏi AI bất cứ điều gì..."
        showImageButton={false}
        isTyping={isTyping}
        highlightedMessageId={currentHighlightedMessageId}
        scrollToMessageId={currentHighlightedMessageId}
        hideInput={showSearch}
        onDeleteMessage={handleDeleteMessage}
      />
      {isGenerating && streamingMessage && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.05)"
          p={10}
          borderTopWidth={1}
          borderTopColor={colors.divider}>
          <Box flexDirection="row" alignItems="center" gap={8}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text fontSize={12} color={colors.textSecondary}>
              AI đang trả lời... ({streamingMessage.message?.length || 0} ký tự)
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatAIScreen;
