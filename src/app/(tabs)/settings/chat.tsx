import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Box } from '../../../components/common/Layout/Box'
import { useLLM, LLAMA3_2_1B, Message, MessageRole } from 'react-native-executorch';

// Type cho chat message
interface ChatMessage {
  role: MessageRole;
  content: string;
}

const SettingsScreen = () => {
  const llm = useLLM({ model: LLAMA3_2_1B });
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Theo dõi khi model generate xong
  useEffect(() => {
    if (llm.response && !llm.isGenerating) {
      // Thêm response của AI vào chat history
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: llm.response
      }]);
    }
  }, [llm.response, llm.isGenerating]);

  // ✅ Gửi tin nhắn - ĐÃ SỬA
  const handleSend = async () => {
    if (!input.trim() || !llm.isReady) return;

    // Thêm tin nhắn của user vào chat history
    const userMessage: ChatMessage = { role: 'user' as MessageRole, content: input.trim() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    
    setInput('');

    try {
      // ✅ Truyền array của messages, không phải string
      await llm.generate(newHistory as Message[]);
    } catch (error) {
      console.error('Error generating response:', error);
      // Hiển thị lỗi cho user
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      setChatHistory(prev => [...prev, {
        role: 'system' as MessageRole,
        content: `Lỗi: ${errorMessage}`
      }]);
    }
  };

  // Render từng tin nhắn
  const renderMessage = (message: ChatMessage, index: number) => (
    <View
      key={index}
      style={[
        styles.messageBubble,
        message.role === 'user' ? styles.userMessage : 
        message.role === 'system' ? styles.systemMessage :
        styles.aiMessage
      ]}
    >
      <Text style={styles.messageRole}>
        {message.role === 'user' ? '👤 Bạn' : 
         message.role === 'system' ? '⚠️ Hệ thống' :
         '🤖 AI'}
      </Text>
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  );

  return (
    <Box flex={1} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat với AI Offline</Text>
        <Text style={styles.headerSubtitle}>
          {llm.isReady ? '✅ Sẵn sàng' : `⏳ Đang tải... ${Math.round(llm.downloadProgress * 100)}%`}
        </Text>
      </View>

      {/* Download Progress */}
      {!llm.isReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Đang tải model AI... {Math.round(llm.downloadProgress * 100)}%
          </Text>
          <Text style={styles.loadingSubtext}>
            Chỉ cần tải một lần, sau đó dùng offline mãi mãi!
          </Text>
        </View>
      )}

      {/* Chat History */}
      {llm.isReady && (
        <>
          <ScrollView style={styles.chatContainer}>
            {chatHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  💬 Gửi tin nhắn để bắt đầu chat với AI offline! 🚀
                </Text>
              </View>
            ) : (
              chatHistory.map(renderMessage)
            )}

            {/* Hiển thị response đang generate */}
            {llm.isGenerating && (
              <View style={[styles.messageBubble, styles.aiMessage]}>
                <Text style={styles.messageRole}>🤖 AI</Text>
                <Text style={styles.messageText}>{llm.response}</Text>
                <ActivityIndicator size="small" color="#666" style={styles.generatingIndicator} />
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChangeText={setInput}
              multiline
              editable={llm.isReady && !llm.isGenerating}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || !llm.isReady || llm.isGenerating) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!input.trim() || !llm.isReady || llm.isGenerating}
            >
              <Text style={styles.sendButtonText}>
                {llm.isGenerating ? '⏸' : '📤'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Error Display */}
      {llm.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Lỗi: {llm.error}</Text>
        </View>
      )}
    </Box>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  systemMessage: {
    backgroundColor: '#FFE5E5',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  generatingIndicator: {
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
});
