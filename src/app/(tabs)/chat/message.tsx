import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  GiftedChat,
  IMessage,
  Send,
  Bubble,
  InputToolbar,
  Actions,
  MessageImage,
  MessageImageProps,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BluetoothModule from "../../../assets/managers/BluetoothModule";
import { Message } from "../../../types/types";
import { launchImageLibrary } from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";
import { requestPermissions } from "../../../utils/permission";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RenderMessageImage } from "../../../features/chat/components/RenderMessageImage";

interface BluetoothDevice {
  name: string;
  address: string;
  paired?: boolean;
}

const MessageScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [bluetoothName, setBluetoothName] = useState<string>("");
  const [bluetoothAddress, setBluetoothAddress] = useState<string>("");
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Lưu trữ các chunks ảnh đang nhận
  const imageChunksRef = useRef<{
    [key: string]: {
      chunks: string[];
      totalChunks: number;
      receivedChunks: number;
      timestamp: number;
      senderName: string;
      senderAddress: string;
    };
  }>({});

  useEffect(() => {
    initBluetooth();
    setupBluetoothListeners();

    return () => {
      BluetoothModule.removeAllListeners();
    };
  }, []);

  const initBluetooth = async () => {
    try {
      const name = await BluetoothModule.getBluetoothName();
      const address = await BluetoothModule.getBluetoothAddress();
      setBluetoothName(name);
      setBluetoothAddress(address);

      // Lấy danh sách thiết bị đã kết nối (trả về string[] là addresses)
      const deviceAddresses = await BluetoothModule.getConnectedDevices();
      const devices: BluetoothDevice[] = deviceAddresses.map((addr) => ({
        name: "Connected Device",
        address: addr,
        paired: true,
      }));
      setConnectedDevices(devices);

      console.log("✅ Bluetooth initialized:", name, address);
    } catch (error) {
      console.error("❌ Init Bluetooth error:", error);
    }
  };

  const setupBluetoothListeners = () => {
    // Lắng nghe tin nhắn đến
    BluetoothModule.addEventListener("onMessageReceived", handleMessageReceived);

    // Lắng nghe kết nối mới
    BluetoothModule.addEventListener("onConnected", (info) => {
      const device: BluetoothDevice = {
        name: info.deviceName,
        address: info.deviceAddress,
        paired: true,
      };
      setConnectedDevices((prev) => [...prev, device]);
      addSystemMessage(`${info.deviceName} đã kết nối`);
    });

    // Lắng nghe ngắt kết nối
    BluetoothModule.addEventListener("onDisconnected", (info) => {
      setConnectedDevices((prev) =>
        prev.filter((d) => d.address !== info.deviceAddress)
      );
      addSystemMessage(`Đã ngắt kết nối`);
    });

    // Lắng nghe nhận ảnh
    BluetoothModule.addEventListener("onImageReceived", (data) => {
      console.log("📸 Image received:", data.filePath);
      addMessage({
        _id: `img_${Date.now()}`,
        text: "",
        createdAt: new Date(),
        user: {
          _id: data.deviceAddress,
          name: data.deviceName,
        },
        image: `file://${data.filePath}`,
      });
    });
  };

  const handleMessageReceived = (data: any) => {
    const { message, senderName, senderAddress } = data;

    console.log("📩 Received:", message);

    // Xử lý tin nhắn ảnh
    if (message.startsWith("IMG_START|")) {
      handleImageStart(message, senderName, senderAddress);
    } else if (message.startsWith("IMG_CHUNK|")) {
      handleImageChunk(message, senderName, senderAddress);
    } else if (message.startsWith("IMG_END|")) {
      handleImageEnd(message, senderName, senderAddress);
    } else {
      // Tin nhắn text thông thường
      addMessage({
        _id: `${senderAddress}_${Date.now()}`,
        text: message,
        createdAt: new Date(),
        user: {
          _id: senderAddress,
          name: senderName,
          avatar: undefined,
        },
      });
    }
  };

  const handleImageStart = (
    message: string,
    senderName: string,
    senderAddress: string
  ) => {
    const parts = message.split("|");
    const messageId = parts[1];
    const totalChunks = parseInt(parts[2]);
    const timestamp = parseInt(parts[3]);

    console.log(`📸 Image start: ${messageId}, ${totalChunks} chunks`);

    // Khởi tạo storage cho ảnh
    imageChunksRef.current[messageId] = {
      chunks: new Array(totalChunks).fill(""),
      totalChunks,
      receivedChunks: 0,
      timestamp,
      senderName,
      senderAddress,
    };

    // Thêm message placeholder
    addMessage({
      _id: messageId,
      text: "📷 Đang nhận ảnh...",
      createdAt: new Date(timestamp),
      user: {
        _id: senderAddress,
        name: senderName,
      },
    });
  };

  const handleImageChunk = (
    message: string,
    senderName: string,
    senderAddress: string
  ) => {
    const parts = message.split("|");
    const messageId = parts[1];
    const chunkIndex = parseInt(parts[2]);
    const chunkData = parts[3];

    const imageData = imageChunksRef.current[messageId];
    if (!imageData) {
      console.warn("⚠️ Received chunk for unknown image:", messageId);
      return;
    }

    // Lưu chunk
    imageData.chunks[chunkIndex] = chunkData;
    imageData.receivedChunks++;

    const progress = Math.round(
      (imageData.receivedChunks / imageData.totalChunks) * 100
    );

    console.log(
      `📦 Chunk ${chunkIndex + 1}/${imageData.totalChunks} (${progress}%)`
    );

    // Cập nhật progress
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? { ...msg, text: `📷 Đang nhận ảnh... ${progress}%` }
          : msg
      )
    );
  };

  const handleImageEnd = (
    message: string,
    senderName: string,
    senderAddress: string
  ) => {
    const parts = message.split("|");
    const messageId = parts[1];

    const imageData = imageChunksRef.current[messageId];
    if (!imageData) {
      console.warn("⚠️ Received end for unknown image:", messageId);
      return;
    }

    // Ghép tất cả chunks
    const base64Image = imageData.chunks.join("");

    console.log(
      `✅ Image received: ${messageId}, ${(base64Image.length / 1024).toFixed(
        1
      )}KB`
    );

    // Cập nhật message với ảnh
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              text: "",
              image: `data:image/jpeg;base64,${base64Image}`,
            }
          : msg
      )
    );

    // Xóa khỏi ref
    delete imageChunksRef.current[messageId];
  };

  const addMessage = (message: IMessage) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );
  };

  const addSystemMessage = (text: string) => {
    addMessage({
      _id: `system_${Date.now()}`,
      text,
      createdAt: new Date(),
      user: {
        _id: 0,
        name: "System",
      },
      system: true,
    });
  };

  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      if (connectedDevices.length === 0) {
        Alert.alert(
          "⚠️ Chưa kết nối",
          "Vui lòng kết nối với thiết bị khác trước"
        );
        return;
      }

      const message = messages[0];
      try {
        await BluetoothModule.sendMessageToAll(message.text);
        addMessage(message);
        console.log("✅ Sent message:", message.text);
      } catch (error: any) {
        console.error("❌ Send error:", error);
        Alert.alert("❌ Lỗi", "Không thể gửi tin nhắn");
      }
    },
    [connectedDevices, bluetoothName, bluetoothAddress]
  );

  const pickImage = async () => {
    try {
      if (connectedDevices.length === 0) {
        Alert.alert(
          "⚠️ Chưa kết nối",
          "Vui lòng kết nối với thiết bị khác trước khi gửi ảnh"
        );
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert("⚠️ Quyền bị từ chối", "Cần quyền truy cập ảnh");
        return;
      }

      setIsLoading(true);

      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 1.0,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        setIsLoading(false);
        return;
      }

      if (result.errorCode) {
        setIsLoading(false);
        Alert.alert("❌ Lỗi", result.errorMessage || "Không thể chọn ảnh");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (!asset.uri) {
          setIsLoading(false);
          Alert.alert("❌ Lỗi", "Không thể đọc ảnh");
          return;
        }

        // Nén ảnh
        const compressedImage = await ImageResizer.createResizedImage(
          asset.uri,
          asset.width && asset.width > 1920 ? 1920 : asset.width || 1920,
          asset.height && asset.height > 1920 ? 1920 : asset.height || 1920,
          "JPEG",
          60,
          0,
          undefined,
          false
        );

        // Đọc Base64
        const base64Image = await RNFS.readFile(
          compressedImage.uri.replace("file://", ""),
          "base64"
        );

        console.log(
          "📤 Compressed:",
          (base64Image.length / 1024).toFixed(1),
          "KB"
        );

        const messageId = `img_${Date.now()}`;
        const timestamp = Date.now();

        // Thêm message preview ngay
        addMessage({
          _id: messageId,
          text: "",
          createdAt: new Date(timestamp),
          user: {
            _id: bluetoothAddress || "me",
            name: bluetoothName || "Tôi",
          },
          image: `data:image/jpeg;base64,${base64Image}`,
        });

        // Chia thành chunks và gửi
        const TOTAL_CHUNKS = 10;
        const chunkSize = Math.ceil(base64Image.length / TOTAL_CHUNKS);
        const chunks: string[] = [];

        for (let i = 0; i < TOTAL_CHUNKS; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, base64Image.length);
          chunks.push(base64Image.substring(start, end));
        }

        // Gửi header
        await BluetoothModule.sendMessageToAll(
          `IMG_START|${messageId}|${TOTAL_CHUNKS}|${timestamp}`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Gửi từng chunk
        for (let i = 0; i < chunks.length; i++) {
          await BluetoothModule.sendMessageToAll(
            `IMG_CHUNK|${messageId}|${i}|${chunks[i]}`
          );
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Gửi end marker
        await BluetoothModule.sendMessageToAll(`IMG_END|${messageId}`);

        console.log("✅ Đã gửi xong ảnh");
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("❌ Image picker error:", error);
      Alert.alert("❌ Lỗi", error.message || "Không thể chọn/gửi ảnh");
    }
  };

  // Custom UI Components
  const renderSend = (props: any) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <Icon name="send" size={24} color="#007AFF" />
        </View>
      </Send>
    );
  };
  const renderMessageImage = (props:MessageImageProps<IMessage>) => {
  return (
    <MessageImage
      {...props}
      imageStyle={{
        width: 200,
        height: 600,
        borderRadius: 10,
        margin: 5,
        resizeMode: "contain",
      }}
    />
  );
};
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#007AFF",
          },
          left: {
            backgroundColor: "#E5E5EA",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
          left: {
            color: "#000",
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.primaryInput}
      />
    );
  };

  const renderActions = (props: any) => {
    return (
      <Actions
        {...props}
        containerStyle={styles.actionsContainer}
        icon={() => <Icon name="image" size={28} color="#007AFF" />}
        onPressActionButton={pickImage}
      />
    );
  };

  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header thông tin kết nối */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>
          {connectedDevices.length > 0
            ? `📱 Đã kết nối với ${connectedDevices.length} thiết bị`
            : "⚠️ Chưa kết nối"}
        </Text>
        <Text style={styles.headerSubtitle}>{bluetoothName}</Text>
      </View>

      {/* Gifted Chat */}
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: bluetoothAddress || "me",
          name: bluetoothName || "Tôi",
        }}
        renderSend={renderSend}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderActions}
        renderLoading={renderLoading}
        placeholder="Nhập tin nhắn..."
        alwaysShowSend
        showUserAvatar={false}
        renderUsernameOnMessage
        renderAvatarOnTop
        inverted={true}
        renderMessageImage={(props) => <RenderMessageImage {...props} />}
      
      />

      {/* Loading overlay khi đang chọn ảnh */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
        </View>
      )}
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#fff",
    paddingVertical: 5,
  },
  primaryInput: {
    alignItems: "center",
  },
  actionsContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
});