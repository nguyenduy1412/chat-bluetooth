import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';
// @ts-ignore
import {Box} from '@/components/common/Layout/Box';
// @ts-ignore
import {Text} from '@/components/common/Text/Text';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

// Config dayjs
dayjs.extend(relativeTime);
dayjs.locale('vi');

// Import images
const DEFAULT_AVATAR = require('../../../assets/images/avatar-default.jpeg');
const AI_AVATAR = require('../../../assets/images/AI-3.jpg');

interface RoomItemProps {
  name: string;
  avatar?: string | null;
  lastMessage?: {
    message?: string;
    type?: string;
    createdAt?: Date;
  } | null;
  updatedAt?: Date;
  isAI?: boolean;
  onPress: () => void;
  isScanned?: boolean;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const RoomItem = ({
  name,
  avatar,
  lastMessage,
  updatedAt,
  isAI = false,
  onPress,
  isScanned = false,
  isConnected = false,
  onConnect,
  onDisconnect,
}: RoomItemProps) => {
  // Logic hiển thị ảnh
  const getAvatarSource = () => {
    if (isAI) {
      return AI_AVATAR;
    }
    if (avatar && avatar.length > 10) {
      return {uri: avatar};
    }
    return DEFAULT_AVATAR;
  };

  // Logic hiển thị tin nhắn cuối
  const getLastMessageText = () => {
    if (isAI && !lastMessage) return 'Trợ lý AI sẵn sàng hỗ trợ bạn';
    if (!lastMessage) return 'Chưa có tin nhắn';

    if (lastMessage.type === 'image') {
      return '📷 Hình ảnh';
    }

    return lastMessage.message || ' ';
  };

  // Logic display time
  const getTimeText = () => {
    // If AI, always show status
    if (isAI) return 'Luôn sẵn sàng';

    const time = lastMessage?.createdAt || updatedAt;
    if (!time) return '';
    return dayjs(time).fromNow();
  };

  return (
    <Box onPress={onPress}>
      <Box
        backgroundColor={isScanned || isAI ? '#F0FFF4' : 'white'}
        p={12}
        mb={10}
        borderRadius={16}
        flexDirection="row"
        alignItems="center"
        borderWidth={isScanned || isAI ? 1.5 : 1}
        borderColor={isScanned || isAI ? '#48BB78' : '#f0f0f0'}
        style={styles.shadow}>
        {/* Avatar */}
        <Box>
          <Image source={getAvatarSource()} style={styles.avatar} />
          {(isScanned || isAI) && (
            <Box
              position="absolute"
              bottom={0}
              right={0}
              width={14}
              height={14}
              borderRadius={7}
              backgroundColor="#48BB78"
              borderWidth={2}
              borderColor="white"
            />
          )}
        </Box>

        {/* Content - Name & Message */}
        <Box flex={1} ml={12} justifyContent="center">
          <Text
            fontSize={16}
            fontWeight="bold"
            color="#1a1a1a"
            numberOfLines={1}
            style={{marginBottom: 4}}>
            {name || 'Unknown'}
          </Text>
          <Text
            fontSize={14}
            color="#666"
            numberOfLines={1}
            style={{lineHeight: 20}}>
            {getLastMessageText()}
          </Text>
        </Box>

        {/* Right Side - Time & Action */}
        <Box alignItems="flex-end" ml={8}>
          <Text
            fontSize={11}
            color="#888"
            fontWeight="normal"
            style={{marginBottom: isScanned ? 8 : 0}}>
            {getTimeText()}
          </Text>

          {isScanned && (
            <Box
              onPress={isConnected ? onDisconnect : onConnect}
              style={{
                backgroundColor: isConnected ? '#FF3B30' : '#48BB78',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}>
              <Text color="white" fontSize={12} fontWeight="bold">
                {isConnected ? 'Ngắt' : 'Kết nối'}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
});
