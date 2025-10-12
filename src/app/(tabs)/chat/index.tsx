
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BluetoothModule from "../../../assets/managers/BluetoothModule";
import { requestPermissions } from "../../../utils/permission";
import { navigate } from "../../../utils/navigationUtils";
import { Box } from "../../../components/common/Layout/Box";
import { Text } from "../../../components/common/Text/Text";


// Interface cho device
interface BluetoothDevice {
  name: string;
  address: string;
  bondState: "BONDED" | "BONDING" | "NONE" | "UNKNOWN";
}

interface ConnectedDevice {
  name: string;
  address: string;
}
const ListMessageScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);

  // ✅ Kiểm tra và bật Bluetooth
  const checkAndEnableBluetooth = async () => {
    try {
      const available = await BluetoothModule.isBluetoothAvailable();
      if (!available) {
        Alert.alert("❌ Lỗi", "Thiết bị không hỗ trợ Bluetooth");
        return false;
      }
      const enabled = await BluetoothModule.isBluetoothEnabled();
      setIsEnabled(enabled);

      if (!enabled) {
        await BluetoothModule.enableBluetooth();
        setTimeout(async () => {
          const nowEnabled = await BluetoothModule.isBluetoothEnabled();
          setIsEnabled(nowEnabled);
          if (nowEnabled) {
            // loadBluetoothName();
          }
        }, 1000);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("Check Bluetooth error:", error);
      return false;
    }
  };



  // ✅ Quét thiết bị (chỉ app của bạn)
  const startDiscovery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          "⚠️ Quyền bị từ chối",
          "Chưa được cấp quyền Bluetooth và Location"
        );
        return;
      }

      const enabled = await checkAndEnableBluetooth();
      if (!enabled) {
        return;
      }

      setDiscovering(true);
      setDevices([]);
      const res = await BluetoothModule.startDiscovery();
      console.log("====================================");
      console.log("Discovery started:", res);
      console.log("====================================");
    } catch (error: any) {
      console.error("Discovery error:", error);
      Alert.alert("❌ Lỗi quét", error.message || String(error));
      setDiscovering(false);
    }
  };

  // ✅ Dừng quét
  const stopDiscovery = async () => {
    try {
      await BluetoothModule.stopDiscovery();
      setDiscovering(false);
    } catch (error: any) {
      console.error("Stop discovery error:", error);
    }
  };

  // ✅ Kết nối tới thiết bị
  const connectTo = async (device: BluetoothDevice) => {
    try {
      await BluetoothModule.connectToDevice(device.address);
    } catch (error: any) {
      console.error("Connect error:", error);
      Alert.alert(
        "❌ Kết nối thất bại",
        `Không thể kết nối với ${device.name}\n\n${
          error.message || String(error)
        }`,
        [
          { text: "Thử lại", onPress: () => connectTo(device) },
          { text: "Đóng", style: "cancel" },
        ]
      );
    }
  };

  // ✅ Khởi động server (chờ kết nối đến)
  const startServer = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert("⚠️ Quyền bị từ chối", "Chưa được cấp quyền Bluetooth");
        return;
      }

      await BluetoothModule.startServer();
      const address = await BluetoothModule.getBluetoothAddress();

      Alert.alert(
        "✅ Server đã khởi động",
        `Thiết bị của bạn đang chờ kết nối.\n\n` +
          `📍 MAC: ${address}\n\n` +
          `💡 Thiết bị khác có thể quét và kết nối`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Start server error:", error);
      Alert.alert("❌ Lỗi", error.message || String(error));
    }
  };

  // ✅ Ngắt kết nối với một thiết bị
  const disconnect = async (address: string) => {
    try {
      await BluetoothModule.disconnect(address);
    } catch (error: any) {
      console.error("Disconnect error:", error);
    }
  };

  // ✅ Ngắt tất cả kết nối
  const disconnectAll = async () => {
    try {
      await BluetoothModule.disconnectAll();
      setConnectedDevices([]);
    } catch (error: any) {
      console.error("Disconnect all error:", error);
    }
  };



  useEffect(() => {
    // Listener: Tìm thấy thiết bị (chỉ app của bạn)
    const deviceFoundListener = BluetoothModule.addEventListener(
      "onDeviceFound",
      (device: BluetoothDevice) => {
        console.log("✅ Tìm thấy thiết bị app:", device);
        setDevices((prev) => {
          const exists = prev.find(
            (d) => d.address === device.address || device.name === "Unknown"
          );
          if (exists) return prev;
          return [...prev, device];
        });
      }
    );

    // Listener: Quét xong
    const discoveryFinishedListener = BluetoothModule.addEventListener(
      "onDiscoveryFinished",
      () => {
        console.log("Quét xong");
        setDiscovering(false);
      }
    );

    // Listener: Kết nối thành công
    const connectedListener = BluetoothModule.addEventListener(
      "onConnected",
      (info: { deviceName: string; deviceAddress: string }) => {
        console.log("Đã kết nối:", info);
        setConnectedDevices((prev) => {
          const exists = prev.find((d) => d.address === info.deviceAddress);
          if (exists) return prev;
          return [
            ...prev,
            { name: info.deviceName, address: info.deviceAddress },
          ];
        });
        navigate("ChatStack", {
          screen: "Message"
        });
      }
    );

    // Listener: Ngắt kết nối
    const disconnectedListener = BluetoothModule.addEventListener(
      "onDisconnected",
      (info: { deviceAddress: string }) => {
        console.log("Đã ngắt kết nối:", info);
        setConnectedDevices((prev) =>
          prev.filter((d) => d.address !== info.deviceAddress)
        );
      }
    );

    // Listener: Mất kết nối
    const connectionLostListener = BluetoothModule.addEventListener(
      "onConnectionLost",
      (info: { deviceAddress: string }) => {
        console.log("Mất kết nối:", info);
        setConnectedDevices((prev) =>
          prev.filter((d) => d.address !== info.deviceAddress)
        );
        Alert.alert("⚠️ Mất kết nối", "Đã mất kết nối với thiết bị");
      }
    );

  
    // Listener: Kết nối thất bại
    const connectionFailedListener = BluetoothModule.addEventListener(
      "onConnectionFailed",
      (error: {
        error: string;
        deviceName?: string;
        deviceAddress?: string;
      }) => {
        console.log("Kết nối thất bại:", error);

        const title = error.deviceName
          ? `❌ Không thể kết nối với ${error.deviceName}`
          : "❌ Kết nối thất bại";

        Alert.alert(title, error.error, [
          {
            text: "Thử lại",
            onPress: () => {
              if (error.deviceAddress) {
                const device = devices.find((d) => d.address === error.deviceAddress);
                if (device) connectTo(device);
              }
            },
          },
          { text: "Đóng", style: "cancel" },
        ]);
      }
    );

    return () => {
      deviceFoundListener.remove();
      discoveryFinishedListener.remove();
      connectedListener.remove();
      disconnectedListener.remove();
      connectionLostListener.remove();
      connectionFailedListener.remove();
    };
  }, []);

  // ✅ Init khi mount
  useEffect(() => {
    const init = async () => {
      await requestPermissions();
      await checkAndEnableBluetooth();
    };

    init();

    return () => {
      BluetoothModule.disconnectAll().catch(console.error);
      BluetoothModule.stopDiscovery().catch(console.error);
    };
  }, []);

  // Render device item
  const renderDevice = ({ item }: { item: BluetoothDevice }) => {
    const isConnectedDevice = connectedDevices.some(
      (d) => d.address === item.address
    );

    return (
      <TouchableOpacity
        onPress={() => !isConnectedDevice && connectTo(item)}
        disabled={isConnectedDevice}
      >
        <Box
          backgroundColor="white"
          p={16}
          mb={10}
          borderRadius={12}
          flexDirection="row"
          alignItems="center"
        >
          <Box flex={1}>
            <Text fontSize={17} fontWeight="bold" color="#333" >
              {item.name || "Unknown"} {isConnectedDevice && "✅"}
            </Text>
            <Text fontSize={12} color="#999" >
              {item.address}
            </Text>
            {item.bondState === "BONDED" && (
              <Text fontSize={11} color="#007AFF">
                🔗 Đã ghép nối
              </Text>
            )}
          </Box>
          <TouchableOpacity
            onPress={() => isConnectedDevice ? disconnect(item.address) : connectTo(item)}
          >
            <Box 
              backgroundColor={isConnectedDevice ? "#FF3B30" : "#007AFF"}
              py={8}
              px={16}
              borderRadius={8}
            >
              <Text color="white" fontWeight="bold">
                {isConnectedDevice ? "Ngắt" : "Kết nối"}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </TouchableOpacity>
    );
  };
  // Giao diện kết nối
  return (
    <Box flex={1} backgroundColor="#f5f5f5" px={16} pt={top} pb={bottom}>
      <Text fontSize={26} fontWeight="bold" align="center" color="#333">
        💬 Chat qua Bluetooth
      </Text>

      {/* Trạng thái */}
      <Box backgroundColor="white" p={14} borderRadius={12} mb={16}>
        <Text fontSize={14} color="#666" >
          Bluetooth: {isEnabled ? "✅ Đã bật" : "❌ Chưa bật"}
        </Text>
        {connectedDevices.length > 0 && (
          <Text fontSize={14} color="#666">
            ✅ Đã kết nối với {connectedDevices.length} thiết bị
          </Text>
        )}
      </Box>

      {/* Các nút chức năng */}
      <Box mb={16}>
        <Text fontSize={16} fontWeight="bold" color="#333">
          ⚙️ Chức năng
        </Text>

        <Box flexDirection="row" mb={8} gap={8}>
          <Box flex={1}>
            <TouchableOpacity
              onPress={discovering ? stopDiscovery : startDiscovery}
              disabled={!isEnabled}
            >
              <Box 
                backgroundColor={!isEnabled ? "#ccc" : "#007AFF"}
                py={12}
                borderRadius={8}
                alignItems="center"
              >
                <Text color="white" fontWeight="bold">
                  {discovering ? "⏸ Dừng" : "🔍 Quét"}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
          <Box flex={1}>
            <TouchableOpacity onPress={startServer} disabled={!isEnabled}>
              <Box 
                backgroundColor={!isEnabled ? "#ccc" : "#007AFF"}
                py={12}
                borderRadius={8}
                alignItems="center"
              >
                <Text color="white" fontWeight="bold">
                  🌐 Chờ kết nối
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>

        {connectedDevices.length > 0 && (
          <Box flexDirection="row" justifyContent="flex-end">
            <TouchableOpacity onPress={disconnectAll}>
              <Box 
                backgroundColor="#FF3B30"
                py={12}
                px={16}
                borderRadius={8}
                alignItems="center"
              >
                <Text color="white" fontWeight="bold">
                  ❌ Ngắt tất cả
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        )}
      </Box>

      {/* Indicator khi đang quét */}
      {discovering && (
        <Box 
          flexDirection="row" 
          alignItems="center" 
          justifyContent="center"
          p={14}
          backgroundColor="white"
          borderRadius={12}
          mb={16}
        >
          <ActivityIndicator size="small" color="#007AFF" />
          <Text color="#666" fontSize={14}>
            Đang tìm thiết bị chạy app...
          </Text>
        </Box>
      )}

      {/* Danh sách thiết bị */}
      {devices.length > 0 && (
        <Box flex={1}>
          <Text fontSize={16} fontWeight="bold" color="#333">
            📱 Thiết bị khả dụng ({devices.length})
          </Text>
          <FlatList
            data={devices}
            keyExtractor={(item, index) => `${item.address}-${index}`}
            renderItem={renderDevice}
            showsVerticalScrollIndicator={false}
          />
        </Box>
      )}

      {/* Thông báo khi chưa có thiết bị */}
      {!discovering && devices.length === 0 && (
        <Box flex={1} justifyContent="center" alignItems="center" py={40}>
          <Text fontSize={64} >📱</Text>
          <Text fontSize={18} fontWeight="bold" color="#666" >
            Chưa tìm thấy thiết bị nào
          </Text>
          <Text fontSize={14} color="#999" align="center" >
            Nhấn "Quét" để tìm thiết bị{"\n"}
            hoặc "Chờ kết nối" để người khác kết nối đến
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ListMessageScreen;
