import LottieBox from 'lottie-react-native';
import React, {useRef, useEffect, useState, useMemo, useCallback} from 'react';
import {
  SectionList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {dayjs} from '@/utils/date';
import {IMAGE_ICON, SEND_ICON} from '../../../assets/animation';
import {Box} from '../../../components/common/Layout/Box';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import ImageModal from './ImageModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MessageItem from './MessageItem';
import {formatDateHeader} from '../helper';
import {MessageEntity} from '@/database/entities/MessageEntity';
import AnimationThingking from './AnimationThingking';
type CustomChatViewProps = {
  messages: MessageEntity[];
  currentUserId: string | number;
  currentUserName?: string;
  onSend: (text: string) => void;
  onImagePress?: () => void;
  placeholder?: string;
  showImageButton?: boolean;
  isTyping?: boolean;
  highlightedMessageId?: string;
  scrollToMessageId?: string;
  hideInput?: boolean;
  onDeleteMessage?: (messageId: string) => void;
};
export const CustomChatView = ({
  messages,
  currentUserId,
  onSend,
  onImagePress,
  placeholder = 'Nhập tin nhắn...',
  showImageButton = true,
  isTyping = false,
  highlightedMessageId,
  scrollToMessageId,
  hideInput = false,
  onDeleteMessage,
}: CustomChatViewProps) => {
  const [inputText, setInputText] = React.useState('');
  const sectionListRef = useRef<SectionList>(null);
  const animation = useRef<LottieBox>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    undefined,
  );
  const insets = useSafeAreaInsets();
  const [paddingBottom, setPaddingBottom] = useState(20);
  const previousMessageCountRef = useRef(messages.length);

  const groupedMessages = useMemo(() => {
    const groups: {[key: string]: MessageEntity[]} = {};

    messages.forEach(message => {
      const localDate = dayjs(message.createdAt);
      const dateKey = localDate.format('YYYY-MM-DD');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.keys(groups)
      .sort((a, b) => dayjs(b).diff(dayjs(a)))
      .map(dateKey => ({
        title: formatDateHeader(dateKey),
        data: groups[dateKey],
        dateKey,
      }));
  }, [messages]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (insets.bottom === 0) {
        setPaddingBottom(50);
      } else {
        setPaddingBottom(30);
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (insets.bottom === 0) {
        setPaddingBottom(10);
      } else {
        setPaddingBottom(30);
      }
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    const currentLength = messages.length;
    const previousLength = previousMessageCountRef.current;

    // Chỉ scroll khi có tin nhắn mới VÀ groupedMessages không rỗng
    if (
      currentLength > previousLength &&
      currentLength > 0 &&
      groupedMessages.length > 0
    ) {
      setTimeout(() => {
        sectionListRef.current?.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          animated: true,
        });
      }, 100);
    }

    previousMessageCountRef.current = currentLength;
  }, [messages.length, groupedMessages.length]);

  useEffect(() => {
    if (scrollToMessageId && groupedMessages.length > 0) {
      let foundSectionIndex = -1;
      let foundItemIndex = -1;

      for (
        let sectionIndex = 0;
        sectionIndex < groupedMessages.length;
        sectionIndex++
      ) {
        const itemIndex = groupedMessages[sectionIndex].data.findIndex(
          msg => msg.id === scrollToMessageId,
        );
        if (itemIndex !== -1) {
          foundSectionIndex = sectionIndex;
          foundItemIndex = itemIndex;
          break;
        }
      }

      if (foundSectionIndex !== -1 && foundItemIndex !== -1) {
        setTimeout(() => {
          sectionListRef.current?.scrollToLocation({
            sectionIndex: foundSectionIndex,
            itemIndex: foundItemIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      }
    }
  }, [scrollToMessageId, groupedMessages]);

  const handleShowImage = useCallback((uri: string) => {
    if (!uri) {
      return;
    }
    setSelectedImage(uri);
    setModalVisible(true);
  }, []);
  const handleSend = useCallback(() => {
    if (inputText.trim().length === 0) {
      return;
    }
    onSend(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  }, [inputText, onSend]);

  const renderSectionHeader = useCallback(
    ({section}: {section: any}) => (
      <Box alignItems="center" py={12}>
        <Box
          backgroundColor="rgba(0,0,0,0.05)"
          px={16}
          py={6}
          borderRadius={12}>
          <Text fontSize={12} color="#666" fontWeight="bold">
            {section.title}
          </Text>
        </Box>
      </Box>
    ),
    [],
  );
  const renderMessageItem = useCallback(
    ({item}: {item: MessageEntity}) => {
      return (
        <MessageItem
          item={item}
          currentUserId={currentUserId.toString()}
          onShowImage={handleShowImage}
          isHighlighted={item.id === highlightedMessageId}
          onDeleteMessage={onDeleteMessage}
        />
      );
    },
    [currentUserId, handleShowImage, highlightedMessageId, onDeleteMessage],
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Box flex={1} backgroundColor={colors.white}>
        <SectionList
          ref={sectionListRef}
          sections={groupedMessages}
          renderItem={renderMessageItem}
          renderSectionFooter={renderSectionHeader}
          keyExtractor={item => item.id.toString()}
          inverted
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
        {isTyping && (
          <AnimationThingking size={10} color={'#90949c'} duration={1000} />
        )}
        {!hideInput && (
          <Box
            flexDirection="row"
            alignItems="flex-end"
            p={8}
            pb={paddingBottom}
            borderTopWidth={1}
            backgroundColor={colors.white}
            borderTopColor={colors.divider}>
            {showImageButton && onImagePress && (
              <Box style={styles.imageButton} onPress={onImagePress}>
                <LottieBox
                  loop={true}
                  source={IMAGE_ICON}
                  ref={animation}
                  style={styles.icon}
                  autoPlay
                />
              </Box>
            )}

            <Box
              flex={1}
              backgroundColor={'#F0F0F0'}
              borderRadius={20}
              px={16}
              py={4}
              minH={40}
              maxH={100}
              justifyContent="center">
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline
                maxLength={1000}
                returnKeyType="default"
              />
            </Box>
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim().length === 0 && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={inputText.trim().length === 0}
              activeOpacity={0.7}>
              <LottieBox
                loop={true}
                source={SEND_ICON}
                ref={animation}
                style={styles.icon}
                autoPlay
              />
            </TouchableOpacity>
          </Box>
        )}
      </Box>
      <ImageModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        item={selectedImage}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    maxHeight: 80,
    minHeight: 24,
  },
  sendButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
});
