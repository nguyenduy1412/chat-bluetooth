import {Box} from '@/components/common/Layout/Box';
import React, {memo, useCallback} from 'react';
import {Text} from '@/components/common/Text/Text';
import {BluetoothDevice} from '../types';
import {formatName} from '../utils/formatName';
import {Image} from 'react-native';
import {AVATAR} from '@/assets/images';
import {StyleSheet} from 'react-native';

type Props = {
  item: BluetoothDevice;
  onConnected: (isConnectedDevice: boolean, item: BluetoothDevice) => void;
  isConnectedDevice: boolean;
  connectTo: (device: BluetoothDevice) => void;
  disconnect: (address: string) => void;
};
const DeviceItem = ({
  item,
  onConnected,
  isConnectedDevice,
  connectTo,
  disconnect,
}: Props) => {
  const handleConnected = useCallback(() => {
    onConnected(isConnectedDevice, item);
  }, [onConnected, isConnectedDevice, item]);

  return (
    <Box onPress={handleConnected}>
      <Box
        backgroundColor={'#F0FFF4'}
        p={12}
        mb={10}
        borderRadius={16}
        flexDirection="row"
        alignItems="center"
        borderWidth={1.5}
        borderColor={'#48BB78'}
        style={styles.shadow}>
        <Box>
          <Image source={AVATAR} style={styles.avatar} />
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
        </Box>
        <Box flex={1} ml={12} justifyContent="center">
          <Text
            fontSize={16}
            fontWeight="bold"
            color="#1a1a1a"
            numberOfLines={1}
            style={{marginBottom: 4}}>
            {formatName(item.name) || 'Unknown'}
          </Text>
          <Text
            fontSize={14}
            color="#666"
            numberOfLines={1}
            style={{lineHeight: 20}}>
            Sẵn sàng kết nối
          </Text>
        </Box>
        <Box alignItems="flex-end" ml={8}>
          <Box
            onPress={() =>
              isConnectedDevice ? disconnect(item.address) : connectTo(item)
            }>
            <Box
              backgroundColor={isConnectedDevice ? '#FF3B30' : 'red'}
              py={8}
              px={16}
              borderRadius={8}>
              <Text color="white" fontWeight="bold">
                {isConnectedDevice ? 'Ngắt' : 'Kết nối'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(DeviceItem);
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
