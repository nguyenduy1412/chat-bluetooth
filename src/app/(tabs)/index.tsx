
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNFS from "react-native-fs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "../../types/types";
import BluetoothModule from "../../assets/managers/BluetoothModule";
import { requestPermissions } from "../../utils/permission";
import { Box } from "../../components/common/Layout/Box";
import ImageResizer from 'react-native-image-resizer';
import { launchImageLibrary } from 'react-native-image-picker';
import { navigate } from "../../utils/navigationUtils";
import StartLogo from "../../components/common/StartLogo";


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

interface ReceivingImageChunks {
  id:string;
  text:string;
  status:"receiving" | "completed" | "failed";
}
const defaultReceivingImageChunks: ReceivingImageChunks = {
  id: "",
  text: "",
  status: "receiving",
};
const HomeScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [bluetoothName, setBluetoothName] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    []
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const dataImage = useRef<ReceivingImageChunks>(defaultReceivingImageChunks);
  // ✅ Kiểm tra và bật Bluetooth
  console.log("Rendering HomeScreen",messages);
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
            loadBluetoothName();
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

  // ✅ Lấy tên Bluetooth (đã bỏ prefix trong native code)
  const loadBluetoothName = async () => {
    try {
      const name = await BluetoothModule.getBluetoothName();
      setBluetoothName(name);
    } catch (error: any) {
      console.error("Get name error:", error);
    }
  };

  // ✅ Đổi tên Bluetooth
  const handleRename = async () => {
    try {
      if (!bluetoothName.trim()) {
        Alert.alert("⚠️ Cảnh báo", "Vui lòng nhập tên");
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert("⚠️ Quyền bị từ chối", "Cần quyền Bluetooth để đổi tên");
        return;
      }

      const result = await BluetoothModule.setBluetoothName(bluetoothName);
      Alert.alert(
        "✅ Thành công",
        "Tên thiết bị đã được cập nhật.\n\nLưu ý: Thiết bị khác có thể mất vài giây để nhìn thấy tên mới."
      );
    } catch (error: any) {
      console.error("Rename error:", error);
      Alert.alert("❌ Đổi tên thất bại", error.message || String(error));
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

      // Lấy tên và địa chỉ để hiển thị
      const name = bluetoothName || "Unknown";
      const address = await BluetoothModule.getBluetoothAddress();

      Alert.alert(
        "✅ Server đã khởi động",
        `Thiết bị của bạn đang chờ kết nối.\n\n` +
          `� Tên: ${name}\n` +
          `📍 MAC: ${address}\n\n` +
          `💡 Thiết bị khác có thể:\n` +
          `1. Quét thiết bị\n` +
          `2. Chọn "${name}"\n` +
          `3. Kết nối`,
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
      setMessages([]);
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
                const device =
                  devices.find((d) => d.address === error.deviceAddress) ||
                  pairedDevices.find((d) => d.address === error.deviceAddress);
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
      const enabled = await checkAndEnableBluetooth();
      if (enabled) {
        loadBluetoothName();
      }
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
        style={styles.deviceItem}
        onPress={() => !isConnectedDevice && connectTo(item)}
        disabled={isConnectedDevice}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>
            {item.name || "Unknown"} {isConnectedDevice && "✅"}
          </Text>
          <Text style={styles.deviceAddr}>{item.address}</Text>
          {item.bondState === "BONDED" && (
            <Text style={styles.bondState}>🔗 Đã ghép nối</Text>
          )}
        </View>
        {isConnectedDevice ? (
          <Button
            title="Ngắt"
            onPress={() => disconnect(item.address)}
            color="#FF3B30"
          />
        ) : (
          <Button
            title="Kết nối"
            onPress={() => connectTo(item)}
            color="#007AFF"
          />
        )}
      </TouchableOpacity>
    );
  };
  // Giao diện kết nối
  return (
    <Box style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <StartLogo />
    </Box>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  deviceSection: {
    flex: 1,
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  deviceAddr: {
    fontSize: 12,
    color: "#999",
    marginBottom: 3,
  },
  bondState: {
    fontSize: 11,
    color: "#007AFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  // Chat styles
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  chatSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  connectedDevicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  connectedDeviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  connectedDeviceText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
  disconnectButton: {
    fontSize: 16,
    color: "#666",
    fontWeight: "700",
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
  },
  messagesContent: {
    padding: 16,
  },
  messageItem: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageSender: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  attachButtonText: {
    fontSize: 24,
  },
  // File message styles
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  fileIcon: {
    fontSize: 32,
    color: "#666",
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  fileStatus: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginVertical: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  // Image message styles
  imageMessage: {
    maxWidth: "85%",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
});
