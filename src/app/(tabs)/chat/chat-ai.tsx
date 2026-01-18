import { ActivityIndicator, StatusBar} from 'react-native';
import React, {useCallback, useEffect, useState, useMemo, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Message, MessageRole} from 'react-native-executorch';
import {CustomChatView} from '../../../features/chat/components/CustomChatView';
import {CustomMessage} from '../../../features/chat/types';
import {Box} from '../../../components/common/Layout/Box';
import {ArrowLeft} from 'lucide-react-native';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import {goBack} from '../../../utils/navigationUtils';
import useModelStore from '../../../store/modelStore';
import {useLLMContext} from '../../../components/provider/LLMProvider';

const ChatAIScreen = () => {
  const insets = useSafeAreaInsets();
  const {activeModel, loadModels} = useModelStore();
  const llm = useLLMContext();
  console.log('🚀 ChatAIScreen rendered, LLM isReady:', llm.isReady);
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] =
    useState<CustomMessage | null>(null);
  const currentAiMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (llm.response && isGenerating) {
      if (currentAiMessageIdRef.current) {
        setStreamingMessage({
          _id: currentAiMessageIdRef.current,
          text: llm.response,
          createdAt: new Date(),
          user: {
            _id: 'ai',
            name: '🤖 AI Assistant',
          },
        });
      }
    }
  }, [llm.response, isGenerating]);

  useEffect(() => {
    if (!llm.isGenerating && isGenerating && streamingMessage) {
      setMessages(prev => [streamingMessage, ...prev]);

      setStreamingMessage(null);
      currentAiMessageIdRef.current = null;
      setIsGenerating(false);
    }
  }, [llm.isGenerating, isGenerating, streamingMessage]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !llm.isReady || llm.isGenerating) {
        return;
      }

      const trimmedText = text.trim();
      const timestamp = Date.now();

      const userMessage: CustomMessage = {
        _id: `user_${timestamp}`,
        text: trimmedText,
        createdAt: new Date(timestamp),
        user: {
          _id: 'me',
          name: 'Bạn',
        },
      };

      const aiMessageId = `ai_${timestamp}`;
      currentAiMessageIdRef.current = aiMessageId;

      setMessages(prev => {
        setIsGenerating(true);
        const conversationHistory: Message[] = [
          ...prev
            .slice()
            .reverse()
            .map(msg => ({
              role: (msg.user._id === 'ai'
                ? 'assistant'
                : 'user') as MessageRole,
              content: msg.text,
            })),
          {
            role: 'user' as MessageRole,
            content: trimmedText,
          },
        ];

        llm.generate(conversationHistory).catch((error: any) => {
          setIsGenerating(false);
          setStreamingMessage(null);
          currentAiMessageIdRef.current = null;
          const errorMessage: CustomMessage = {
            _id: `error_${Date.now()}`,
            text: `Lỗi: ${
              error instanceof Error ? error.message : 'Không thể tạo phản hồi'
            }`,
            createdAt: new Date(),
            user: {
              _id: 0,
              name: 'System',
            },
            system: true,
          };
          setMessages(prevMsgs => [errorMessage, ...prevMsgs]);
        });

        return [userMessage, ...prev];
      });
    },
    [llm],
  );

  const statusText = useMemo(() => {
    return `${activeModel || 'LLAMA3_2_1B'} • ${
      llm.isGenerating ? '⏳ Đang trả lời...' : '✅ Sẵn sàng'
    }`;
  }, [activeModel, llm.isGenerating]);

  if (!llm.isReady) {
    return (
      <Box flex={1} backgroundColor={colors.white}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Box
          pt={insets.top + 10}
          backgroundColor={colors.primary}
          px={20}
          pb={20}
          gap={10}
          flexDirection="row"
          alignItems="center">
          <Box onPress={goBack}>
            <ArrowLeft color={colors.white} />
          </Box>
          <Text fontSize={20} color={colors.white}>
            Chat với AI
          </Text>
        </Box>

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

  return (
    <Box flex={1} backgroundColor={colors.white}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Box
        pt={insets.top + 10}
        backgroundColor={colors.primary}
        px={20}
        pb={20}
        gap={10}
        flexDirection="row"
        alignItems="center">
        <Box onPress={goBack}>
          <ArrowLeft color={colors.white} />
        </Box>
        <Box flex={1}>
          <Text fontSize={20} color={colors.white}>
            Chat với AI
          </Text>
          <Text fontSize={12} color={colors.white} style={{opacity: 0.8}}>
            {statusText}
          </Text>
        </Box>
      </Box>

      <CustomChatView
        messages={streamingMessage ? [streamingMessage, ...messages] : messages}
        currentUserId="me"
        currentUserName="Bạn"
        onSend={handleSendMessage}
        placeholder="Hỏi AI bất cứ điều gì..."
        showImageButton={false}
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
              AI đang trả lời... ({streamingMessage.text.length} ký tự)
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatAIScreen;
