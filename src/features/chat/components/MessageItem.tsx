/* eslint-disable react-native/no-inline-styles */
import {Box} from '@/components/common/Layout/Box';
import React, {memo, useMemo, useRef} from 'react';
import {Text} from '@/components/common/Text/Text';

import {colors} from '@/theme/colors';
import {Image, StyleSheet, Alert, Animated} from 'react-native';
import {formatTime} from '@/utils/date';
import {MessageEntity} from '@/database/entities/MessageEntity';
import LinearGradient from 'react-native-linear-gradient';
import {Swipeable, RectButton, ScrollView} from 'react-native-gesture-handler';
import {Trash, Trash2} from 'lucide-react-native';

const parseMessage = (message: string) => {
  const parts: Array<{
    type: 'text' | 'code';
    content: string;
    language?: string;
  }> = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: message.substring(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'code',
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < message.length) {
    parts.push({
      type: 'text',
      content: message.substring(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{type: 'text' as const, content: message}];
};

type Props = {
  item: MessageEntity;
  currentUserId: string;
  onShowImage: (uri: string) => void;
  isHighlighted?: boolean;
  onDeleteMessage?: (messageId: string) => void;
};
const MessageItem = ({
  item,
  currentUserId,
  onShowImage,
  isHighlighted,
  onDeleteMessage,
}: Props) => {
  const isMyMessage = item?.created_by === currentUserId;
  const swipeableRef = useRef<Swipeable>(null);

  const messageParts = useMemo(() => {
    return item.message ? parseMessage(item.message) : [];
  }, [item.message]);

  const handleShowImage = (item: MessageEntity) => {
    if (item.type !== 'image') return;
    const imageUri = item.message.startsWith('data:image')
      ? item.message
      : `data:image/jpeg;base64,${item.message}`;
    onShowImage(imageUri);
  };

  const handleDelete = () => {
    // swipeableRef.current?.close();
    onDeleteMessage?.(item.id);
  };

  const renderActions =
    (side: 'left' | 'right') =>
    (
      progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: side === 'right' ? [-80, 0] : [0, 80],
        outputRange: side === 'right' ? [1, 0] : [0, 1],
        extrapolate: 'clamp',
      });

      return (
        <RectButton style={styles.deleteButton} onPress={handleDelete}>
          <Animated.View style={[{transform: [{scale}]}, styles.deleteIcon]}>
            <Trash2 color={'white'} size={40} />
          </Animated.View>
        </RectButton>
      );
    };

  // Kiểm tra xem tin nhắn có chứa code block không
  const hasCodeBlock = messageParts.some(part => part.type === 'code');

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      renderRightActions={isMyMessage ? renderActions('right') : undefined}
      renderLeftActions={!isMyMessage ? renderActions('left') : undefined}
      overshootRight={false}
      overshootLeft={false}
      enabled={!hasCodeBlock}
      containerStyle={{backgroundColor: 'transparent'}}>
      <Box
        flexDirection="row"
        mx={2}
        justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
        mb={10}
        maxW={'100%'}
        backgroundColor={
          isHighlighted ? 'rgba(148, 232, 225, 0.2)' : 'transparent'
        }
        borderRadius={isHighlighted ? 16 : 0}
        py={isHighlighted ? 8 : 0}>
        <Box maxW={'80%'}>
          <Box
            onPress={
              item.type === 'image' ? () => handleShowImage(item) : undefined
            }
            onLongPress={hasCodeBlock ? handleDelete : undefined}>
            <LinearGradient
              colors={
                isMyMessage ? ['#4FACFE', '#00F2FE'] : ['#F1F3F5', '#ECE9E6']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{
                paddingVertical: item.type === 'image' ? 5 : 10,
                paddingHorizontal: item.type === 'image' ? 5 : 16,
                borderTopLeftRadius: isMyMessage ? 30 : 0,
                borderTopRightRadius: isMyMessage ? 0 : 30,
                borderBottomLeftRadius: isMyMessage ? 30 : 18,
                borderBottomRightRadius: isMyMessage ? 18 : 30,
              }}>
              {item.type === 'image' && (
                <Image
                  source={{
                    uri: item.message.startsWith('data:image')
                      ? item.message
                      : `data:image/jpeg;base64,${item.message}`,
                  }}
                  style={{
                    width: item.width,
                    height: item.height,
                    borderRadius: 12,
                  }}
                />
              )}
              {item.type !== 'image' &&
                item.message &&
                item.message.length > 0 && (
                  <Box>
                    {messageParts.map((part, index) => {
                      if (part.type === 'code') {
                        return (
                          <Box
                            key={index}
                            mb={index < messageParts.length - 1 ? 8 : 0}>
                            {part.language && (
                              <Text
                                fontSize={10}
                                color={
                                  isMyMessage ? 'rgba(255,255,255,0.7)' : '#666'
                                }
                                fontWeight="bold">
                                {part.language}
                              </Text>
                            )}
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={true}
                              nestedScrollEnabled={true}
                              style={{maxWidth: '100%'}}>
                              <Box
                                backgroundColor={
                                  isMyMessage
                                    ? 'rgba(0,0,0,0.2)'
                                    : 'rgba(0,0,0,0.05)'
                                }
                                p={12}
                                borderRadius={8}>
                                <Text
                                  style={{fontFamily: 'monospace'}}
                                  fontSize={10}
                                  color={isMyMessage ? colors.white : '#000'}>
                                  {part.content}
                                </Text>
                              </Box>
                            </ScrollView>
                          </Box>
                        );
                      } else {
                        return (
                          <Text
                            key={index}
                            style={{maxWidth: '100%'}}
                            fontSize={16}
                            color={isMyMessage ? colors.white : colors.black}>
                            {part.content}
                          </Text>
                        );
                      }
                    })}
                  </Box>
                )}
            </LinearGradient>
          </Box>

          <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
            {formatTime(item.createdAt!)}
          </Text>
        </Box>
      </Box>
    </Swipeable>
  );
};

export default memo(MessageItem);
const styles = StyleSheet.create({
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
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    paddingBottom: 30,
  },
  deleteIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    padding: 5,
  },
});
