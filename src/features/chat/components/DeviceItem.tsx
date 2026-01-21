import {Box} from '@/components/common/Layout/Box';
import React, {memo, useCallback} from 'react';
import {Text} from '@/components/common/Text/Text';
import {BluetoothDevice} from '../types';
import {formatName} from '../utils/formatName';

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
        backgroundColor="white"
        p={16}
        mb={10}
        borderRadius={12}
        flexDirection="row"
        alignItems="center">
        <Box flex={1}>
          <Text fontSize={17} fontWeight="bold" color="#333">
            {formatName(item.name) || 'Unknown'} {isConnectedDevice && '✅'}
          </Text>
          <Text fontSize={12} color="#999">
            {item.address}
            {item.bondState === 'BONDED' && !isConnectedDevice && (
              <Text
                fontSize={12}
                color={item.isOnline ? 'green' : '#666'}
                style={{fontStyle: 'italic'}}>
                {item.isOnline
                  ? ' • Đã ghép đôi (Online)'
                  : ' • Đã ghép đôi (Offline)'}
              </Text>
            )}
          </Text>
        </Box>
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
  );
};

export default memo(DeviceItem);
