import {useCallback, useState, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Switch,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {navigate} from '../../../utils/navigationUtils';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {colors} from '../../../theme/colors';
import {getUserByAttributes} from '@/features/auth/api/getUserByAttributes';
import {getRoomByMember} from '@/features/chat/api/getRoomByMember';
import {userStore} from '@/store/userStore';
import type {BluetoothDevice} from '@/features/chat/types';
import DeviceItem from '@/features/chat/components/DeviceItem';
import {RoomItem} from '@/features/chat/components/RoomItem';
import {HeaderSearch} from '@/features/chat/components/HeaderSearch';
import {useBluetoothContext} from '@/features/chat/context/BluetoothContext';
import {formatName} from '@/features/chat/utils/formatName';

const ListMessageScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  const {user} = userStore();

  const [searchText, setSearchText] = useState('');
  const {isEnableBluetooth} = userStore();

  const {
    connectTo,
    disconnect,
    devices,
    discovering,
    connectedDevices,
    handleRoomPress,
    rooms,
    onRefresh,
    handleToggleBluetooth,
  } = useBluetoothContext();

  const filteredRooms = useMemo(() => {
    if (!searchText) return rooms;
    return rooms.filter(room =>
      room.receiver.name?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [rooms, searchText]);

  const filteredDevices = useMemo(() => {
    if (!searchText) return devices;
    return devices.filter(
      device =>
        device.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        device.address?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [devices, searchText]);

  const onlineDevicesMap = useMemo(() => {
    const map = new Map<string, BluetoothDevice>();
    devices.forEach(d => map.set(d.address, d));
    return map;
  }, [devices]);

  const displayDevices = useMemo(() => {
    const list = filteredDevices.filter(device => {
      const isLinkedToRoom = rooms.some(
        room => room.receiver?.deviceAddress === device.address,
      );
      return !isLinkedToRoom;
    });

    return list.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return a.isOnline ? -1 : 1;
    });
  }, [filteredDevices, rooms]);

  const handleChatAI = useCallback(async () => {
    const ai = await getUserByAttributes({system: true});
    if (!user?.id || !ai?.id) return;
    const room = await getRoomByMember(user?.id, ai?.id);
    navigate('ChatStack', {
      screen: 'ChatAIScreen',
      params: {
        roomId: room.id,
        receiver: ai,
      },
    });
  }, []);

  return (
    <Box flex={1} backgroundColor="#F5F5F5">
      {/* Custom Header with Search */}
      <Box
        backgroundColor="white"
        pt={top + 10}
        pb={12}
        px={16}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 3,
          zIndex: 10,
        }}>
        <HeaderSearch value={searchText} onChangeText={setSearchText} />
      </Box>

      <FlatList
        data={displayDevices}
        contentContainerStyle={{paddingBottom: bottom + 20}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }
        ListHeaderComponent={
          <Box px={16} pt={16}>
            {/* Bluetooth Toggle Section */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb={20}
              backgroundColor="white"
              p={16}
              borderRadius={16}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box flex={1} mr={16}>
                <Text fontSize={16} fontWeight="bold" color="#333">
                  Bluetooth
                </Text>
                <Text fontSize={13} color="#888">
                  {isEnableBluetooth
                    ? discovering
                      ? 'Đang quét thiết bị xung quanh...'
                      : 'Đã bật & sẵn sàng kết nối'
                    : 'Bật để tìm kiếm thiết bị'}
                </Text>
              </Box>
              <Switch
                trackColor={{false: '#e0e0e0', true: colors.primary}}
                thumbColor={'#fff'}
                ios_backgroundColor="#e0e0e0"
                onValueChange={handleToggleBluetooth}
                value={isEnableBluetooth}
              />
            </Box>

            {/* AI Chat Entry */}
            <RoomItem
              name="Trợ lý AI"
              isAI={true}
              onPress={handleChatAI}
              lastMessage={{
                message: 'Sẵn sàng hỗ trợ bạn mọi lúc',
                type: 'text',
              }}
            />

            {/* Saved Rooms Section */}
            {filteredRooms.length > 0 && (
              <Box mb={8} mt={16}>
                <Box
                  mb={12}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Text fontSize={16} fontWeight="bold" color="#333">
                    Tin nhắn ({filteredRooms.length})
                  </Text>
                </Box>
                {filteredRooms.map(room => {
                  const deviceAddress = room.receiver?.deviceAddress;
                  const matchedDevice = deviceAddress
                    ? onlineDevicesMap.get(deviceAddress)
                    : undefined;
                  const isOnline = !!matchedDevice;
                  const isConnected = deviceAddress
                    ? connectedDevices.some(d => d.address === deviceAddress)
                    : false;

                  return (
                    <RoomItem
                      key={room.id}
                      name={formatName(room.receiver.name) || 'Unknown'}
                      avatar={room.receiver.image}
                      lastMessage={room.lastMessage}
                      updatedAt={room.updatedAt || room.createdAt}
                      onPress={() => handleRoomPress(room)}
                      isScanned={isOnline}
                      isConnected={isConnected}
                      onConnect={() =>
                        matchedDevice && connectTo(matchedDevice)
                      }
                      onDisconnect={() =>
                        matchedDevice && disconnect(matchedDevice.address)
                      }
                    />
                  );
                })}
              </Box>
            )}

            {/* Devices Section Header - Only show if we have devices locally */}
            {displayDevices.length > 0 && (
              <Box
                mb={12}
                mt={16}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center">
                <Text fontSize={16} fontWeight="bold" color="#333">
                  Thiết bị gần đây ({displayDevices.length})
                </Text>
                {discovering && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </Box>
            )}
          </Box>
        }
        renderItem={({item}) => (
          <Box px={16} mb={10}>
            <DeviceItem
              item={item}
              isConnectedDevice={connectedDevices.some(
                d => d.address === item.address,
              )}
              connectTo={connectTo}
              disconnect={disconnect}
              onConnected={(isConnected, device) =>
                isConnected ? disconnect(device.address) : connectTo(device)
              }
            />
          </Box>
        )}
        keyExtractor={item => item.address}
        ListEmptyComponent={
          discovering ? (
            <Box alignItems="center" py={20}>
              <Text color="#999">Đang tìm kiếm thiết bị...</Text>
            </Box>
          ) : displayDevices.length === 0 ? (
            <Box alignItems="center" py={20}>
              <Text color="#999">Không tìm thấy thiết bị nào</Text>
            </Box>
          ) : null
        }
      />
    </Box>
  );
};

export default ListMessageScreen;
