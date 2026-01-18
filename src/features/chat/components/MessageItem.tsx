/* eslint-disable react-native/no-inline-styles */
import {Box} from '@/components/common/Layout/Box';
import React, {memo} from 'react';
import {Text} from '@/components/common/Text/Text';
import {CustomMessage} from '../types';
import {colors} from '@/theme/colors';
import {Image, StyleSheet} from 'react-native';
import {formatTime} from '@/utils/date';

type Props = {
  item: CustomMessage;
  currentUserId: string;
  onShowImage: (uri: string) => void;
};
const MessageItem = ({item, currentUserId, onShowImage}: Props) => {
  const isMyMessage = item.user._id === currentUserId;

  return (
    <Box
      flexDirection="row"
      mx={2}
      justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
      mb={10}
      maxW={'100%'}>
      <Box maxW={'80%'}>
        <Box
          backgroundColor={isMyMessage ? colors.skyBlue : colors.divider}
          p={item.image ? 5 : 16}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          borderBottomLeftRadius={isMyMessage ? 20 : 2}
          borderBottomRightRadius={isMyMessage ? 2 : 20}
          onPress={() => onShowImage(item.image!)}>
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
              style={{maxWidth: '100%'}}
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
});
