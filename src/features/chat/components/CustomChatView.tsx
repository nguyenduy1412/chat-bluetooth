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
import {IMAGE_ICON, SEND_ICON} from '../../../assets/animation';
import {CustomChatViewProps, CustomMessage} from '../types';
import {Box} from '../../../components/common/Layout/Box';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import ImageModal from './ImageModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MessageItem from './MessageItem';
import { formatDateHeader } from '../helper'; 

export const CustomChatView: React.FC<CustomChatViewProps> = ({
  messages,
  currentUserId,
  onSend,
  onImagePress,
  placeholder = 'Nhập tin nhắn...',
  showImageButton = true,
}) => {
  const [inputText, setInputText] = React.useState('');
  const sectionListRef = useRef<SectionList>(null);
  const animation = useRef<LottieBox>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    undefined,
  );
  const insets = useSafeAreaInsets();
  const [paddingBottom, setPaddingBottom] = useState(20);

  // Nhóm messages theo ngày
  const groupedMessages = useMemo(() => {
    const groups: {[key: string]: CustomMessage[]} = {};

    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const dateKey = date.toISOString().split('T')[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    // Chuyển thành array of sections và sắp xếp theo ngày giảm dần
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
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
    if (messages.length > 0) {
      setTimeout(() => {
        sectionListRef.current?.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          animated: true,
        });
      }, 100);
    }
  }, [messages.length]);

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
    ({item}: {item: CustomMessage}) => {
      return (
        <MessageItem
          item={item}
          currentUserId={currentUserId.toString()}
          onShowImage={handleShowImage}
        />
      );
    },
    [currentUserId, handleShowImage],
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
          keyExtractor={item => item._id.toString()}
          inverted
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <Box
          flexDirection="row"
          alignItems="flex-end"
          p={8}
          pb={paddingBottom}
          borderTopWidth={1}
          backgroundColor={colors.white}
          borderTopColor={colors.divider}>
          {showImageButton && onImagePress && (
            <Box
              style={styles.imageButton}
              onPress={onImagePress}>
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
