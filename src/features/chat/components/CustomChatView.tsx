import LottieBox from 'lottie-react-native';
import React, {useRef, useEffect, useState} from 'react';
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import {IMAGE_ICON, SEND_ICON} from '../../../assets/animation';
import {formatTime} from '../../../utils/date';
import {CustomChatViewProps, CustomMessage} from '../types';
import {Box} from '../../../components/common/Layout/Box';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import ImageModal from './ImageModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const CustomChatView: React.FC<CustomChatViewProps> = ({
  messages,
  currentUserId,
  currentUserName = 'Tôi',
  onSend,
  onImagePress,
  placeholder = 'Nhập tin nhắn...',
  showImageButton = true,
}) => {
  const [inputText, setInputText] = React.useState('');
  const flatListRef = useRef<FlatList>(null);
  const animation = useRef<LottieBox>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    undefined,
  );
  const insets = useSafeAreaInsets();
  const [paddingBottom, setPaddingBottom] = useState(20);
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
  }, [paddingBottom]);
  console.log('paddingBottom', paddingBottom,insets.bottom);
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({offset: 0, animated: true});
      }, 100);
    }
  }, [messages.length]);

  const handleShowImage = (uri: string) => {
    if (!uri) return;
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    onSend(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  };

  const renderMessageItem = ({item}: {item: CustomMessage}) => {
    const isMyMessage = item.user._id === currentUserId;
    return (
      <Box
        flexDirection="row"
        mx={2}
        justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
        mb={10}>
        <Box>
          <Box
            backgroundColor={isMyMessage ? colors.skyBlue : colors.divider}
            p={item.image ? 5 : 16}
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            borderBottomLeftRadius={isMyMessage ? 20 : 2}
            borderBottomRightRadius={isMyMessage ? 2 : 20}
            onPress={() => handleShowImage(item.image!)}>
            {item.image && (
              <Image
                source={{uri: item.image}}
                style={{
                  width: item.width,
                  height: item.height,
                  borderRadius: 12,
                }}
              />
            )}
            {item.text.length > 0 && (
              <Text
                fontSize={16}
                color={isMyMessage ? colors.white : colors.black}>
                {item.text}
              </Text>
            )}
          </Box>

          <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
            {formatTime(item.createdAt)}
          </Text>
        </Box>
      </Box>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Box flex={1} backgroundColor={colors.white}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item._id.toString()}
          inverted
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
            <TouchableOpacity
              style={styles.imageButton}
              onPress={onImagePress}
              activeOpacity={0.7}>
              <LottieBox
                loop={true}
                source={IMAGE_ICON}
                ref={animation}
                style={styles.icon}
                autoPlay
              />
            </TouchableOpacity>
          )}

          <Box style={styles.textInputContainer}>
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
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 12,
  },
  myTimestamp: {
    textAlign: 'right',
    marginRight: 12,
    marginLeft: 0,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  imageButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 40,
    maxHeight: 100,
    justifyContent: 'center',
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
