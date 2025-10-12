import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';

const { BluetoothModule } = NativeModules;

export interface BluetoothDevice {
  name: string;
  address: string;
  bondState: 'BONDED' | 'BONDING' | 'NONE' | 'UNKNOWN';
}

export interface ConnectionInfo {
  deviceName: string;
  deviceAddress: string;
}

export interface MessageData {
  message: string;
  deviceAddress: string;
  deviceName: string;
}

export interface DisconnectInfo {
  deviceAddress: string;
}

export interface ConnectionFailedInfo {
  error: string;
  deviceName?: string;
  deviceAddress?: string;
}

export interface DataTransferProgress {
  deviceAddress: string;
  fileName: string;
  type: string;
  progress: number;
  sent?: number;
  received?: number;
  total: number;
}

export interface DataReceiveStart {
  deviceAddress: string;
  deviceName: string;
  fileName: string;
  type: string;
  dataSize: number;
}

export interface BaseReceivedData {
  deviceAddress: string;
  deviceName: string;
  fileName: string;
  type: string;
  fileSize?: number;
  filePath?: string;
}

export interface ImageReceived extends BaseReceivedData {
  type: 'image';
  filePath: string;
  fileSize: number;
}

export interface AudioReceived extends BaseReceivedData {
  type: 'audio';
  filePath: string;
  fileSize: number;
}

export interface FileReceived extends BaseReceivedData {
  type: 'file';
  filePath: string;
  fileSize: number;
}

export interface DataReceived extends BaseReceivedData {
  data: string;
  size: number;
}

export interface BluetoothEvents {
  onDeviceFound: (device: BluetoothDevice) => void;
  onDiscoveryFinished: () => void;
  onConnected: (info: ConnectionInfo) => void;
  onDisconnected: (info: DisconnectInfo) => void;
  onConnectionLost: (info: DisconnectInfo) => void;
  onConnectionFailed: (error: ConnectionFailedInfo) => void;
  onMessageReceived: (data: MessageData) => void;
  
  // Base64 Data Transfer Events
  onDataSendProgress: (data: DataTransferProgress) => void;
  onDataReceiveStart: (data: DataReceiveStart) => void;
  onDataReceiveProgress: (data: DataTransferProgress) => void;
  onDataReceived: (data: DataReceived) => void;
  
  // Specific Type Events
  onImageReceived: (data: ImageReceived) => void;
  onAudioReceived: (data: AudioReceived) => void;
  onFileReceived: (data: FileReceived) => void;
}

class BluetoothModuleWrapper {
  private eventEmitter: NativeEventEmitter;
  private listeners: Map<string, EmitterSubscription> = new Map();

  constructor() {
    this.eventEmitter = new NativeEventEmitter(BluetoothModule);
  }

  // ==================== QUẢN LÝ BLUETOOTH ====================

  /**
   * Kiểm tra Bluetooth có khả dụng trên thiết bị không
   */
  async isBluetoothAvailable(): Promise<boolean> {
    return BluetoothModule.isBluetoothAvailable();
  }

  /**
   * Kiểm tra Bluetooth đã được bật chưa
   */
  async isBluetoothEnabled(): Promise<boolean> {
    return BluetoothModule.isBluetoothEnabled();
  }

  /**
   * Yêu cầu bật Bluetooth (hiện dialog cho user)
   */
  async enableBluetooth(): Promise<string> {
    return BluetoothModule.enableBluetooth();
  }

  /**
   * Đặt tên cho thiết bị Bluetooth
   */
  async setBluetoothName(name: string): Promise<string> {
    return BluetoothModule.setBluetoothName(name);
  }

  /**
   * Lấy tên Bluetooth hiện tại
   */
  async getBluetoothName(): Promise<string> {
    return BluetoothModule.getBluetoothName();
  }

  /**
   * Lấy địa chỉ MAC của thiết bị
   */
  async getBluetoothAddress(): Promise<string> {
    return BluetoothModule.getBluetoothAddress();
  }

  /**
   * Bật chế độ Discoverable (tự động đổi tên có prefix BLE nếu chưa có)
   * @param duration - Thời gian discoverable (giây), tối đa 3600
   */
  async makeDiscoverable(duration: number = 300): Promise<string> {
    return BluetoothModule.makeDiscoverable(duration);
  }

  /**
   * Kiểm tra thiết bị có đang ở chế độ Discoverable không
   */
  async isDiscoverable(): Promise<boolean> {
    return BluetoothModule.isDiscoverable();
  }

  /**
   * Lấy trạng thái scan mode hiện tại
   * @returns Object chứa mode, deviceName, deviceAddress
   */
  async getScanMode(): Promise<{mode: string; deviceName: string; deviceAddress: string}> {
    return BluetoothModule.getScanMode();
  }

  // ==================== QUÉT THIẾT BỊ ====================

  /**
   * Bắt đầu quét các thiết bị Bluetooth xung quanh
   */
  async startDiscovery(): Promise<string> {
    return BluetoothModule.startDiscovery();
  }

  /**
   * Dừng quét thiết bị
   */
  async stopDiscovery(): Promise<string> {
    return BluetoothModule.stopDiscovery();
  }

  /**
   * Lấy danh sách thiết bị đã ghép nối (paired)
   */
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    return BluetoothModule.getPairedDevices();
  }

  // ==================== KẾT NỐI ====================

  /**
   * Khởi động server để chờ kết nối từ thiết bị khác
   */
  async startServer(): Promise<string> {
    return BluetoothModule.startServer();
  }

  /**
   * Dừng server
   */
  async stopServer(): Promise<string> {
    return BluetoothModule.stopServer();
  }

  /**
   * Kết nối đến một thiết bị Bluetooth khác
   * @param address - Địa chỉ MAC của thiết bị (vd: "00:11:22:33:44:55")
   */
  async connectToDevice(address: string): Promise<string> {
    return BluetoothModule.connectToDevice(address);
  }

  /**
   * Ngắt kết nối với một thiết bị cụ thể
   * @param address - Địa chỉ MAC của thiết bị
   */
  async disconnect(address: string): Promise<string> {
    return BluetoothModule.disconnect(address);
  }

  /**
   * Ngắt tất cả kết nối
   */
  async disconnectAll(): Promise<string> {
    return BluetoothModule.disconnectAll();
  }

  /**
   * Kiểm tra có đang kết nối không
   */
  async isConnected(): Promise<boolean> {
    return BluetoothModule.isConnected();
  }

  /**
   * Lấy danh sách thiết bị đã kết nối
   */
  async getConnectedDevices(): Promise<string[]> {
    return BluetoothModule.getConnectedDevices();
  }

  // ==================== GỬI/NHẬN DỮ LIỆU ====================

  /**
   * Gửi tin nhắn đến một thiết bị cụ thể
   * @param address - Địa chỉ MAC của thiết bị
   * @param message - Nội dung tin nhắn
   */
  async sendMessage(address: string, message: string): Promise<string> {
    return BluetoothModule.sendMessage(address, message);
  }

  /**
   * Gửi tin nhắn đến tất cả thiết bị đã kết nối
   * @param message - Nội dung tin nhắn
   */
  async sendMessageToAll(message: string): Promise<string> {
    return BluetoothModule.sendMessageToAll(message);
  }

  // ==================== BASE64 DATA TRANSFER ====================

  /**
   * Gửi dữ liệu Base64 đến một thiết bị cụ thể
   * @param address - Địa chỉ MAC của thiết bị
   * @param base64Data - Dữ liệu đã được encode Base64
   * @param fileName - Tên file hoặc tên dữ liệu
   * @param type - Loại dữ liệu ('image', 'audio', 'file', v.v.)
   */
  async sendBase64Data(address: string, base64Data: string, fileName: string, type: string): Promise<string> {
    return BluetoothModule.sendBase64Data(address, base64Data, fileName, type);
  }

  /**
   * Gửi dữ liệu Base64 đến tất cả thiết bị đã kết nối
   * @param base64Data - Dữ liệu đã được encode Base64
   * @param fileName - Tên file hoặc tên dữ liệu
   * @param type - Loại dữ liệu ('image', 'audio', 'file', v.v.)
   */
  async sendBase64DataToAll(base64Data: string, fileName: string, type: string): Promise<string> {
    return BluetoothModule.sendBase64DataToAll(base64Data, fileName, type);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Gửi ảnh dạng Base64 đến một thiết bị
   * @param address - Địa chỉ MAC của thiết bị
   * @param base64Image - Ảnh đã được encode Base64
   * @param fileName - Tên file ảnh
   */
  async sendImage(address: string, base64Image: string, fileName: string): Promise<string> {
    return this.sendBase64Data(address, base64Image, fileName, 'image');
  }

  /**
   * Gửi ảnh dạng Base64 đến tất cả thiết bị
   * @param base64Image - Ảnh đã được encode Base64
   * @param fileName - Tên file ảnh
   */
  async sendImageToAll(base64Image: string, fileName: string): Promise<string> {
    return this.sendBase64DataToAll(base64Image, fileName, 'image');
  }

  /**
   * Gửi audio dạng Base64 đến một thiết bị
   * @param address - Địa chỉ MAC của thiết bị
   * @param base64Audio - Audio đã được encode Base64
   * @param fileName - Tên file audio
   */
  async sendAudio(address: string, base64Audio: string, fileName: string): Promise<string> {
    return this.sendBase64Data(address, base64Audio, fileName, 'audio');
  }

  /**
   * Gửi audio dạng Base64 đến tất cả thiết bị
   * @param base64Audio - Audio đã được encode Base64
   * @param fileName - Tên file audio
   */
  async sendAudioToAll(base64Audio: string, fileName: string): Promise<string> {
    return this.sendBase64DataToAll(base64Audio, fileName, 'audio');
  }

  /**
   * Gửi file dạng Base64 đến một thiết bị
   * @param address - Địa chỉ MAC của thiết bị
   * @param base64File - File đã được encode Base64
   * @param fileName - Tên file
   */
  async sendFile(address: string, base64File: string, fileName: string): Promise<string> {
    return this.sendBase64Data(address, base64File, fileName, 'file');
  }

  /**
   * Gửi file dạng Base64 đến tất cả thiết bị
   * @param base64File - File đã được encode Base64
   * @param fileName - Tên file
   */
  async sendFileToAll(base64File: string, fileName: string): Promise<string> {
    return this.sendBase64DataToAll(base64File, fileName, 'file');
  }

  // ==================== EVENTS ====================

  /**
   * Đăng ký lắng nghe sự kiện Bluetooth
   */
  addEventListener<K extends keyof BluetoothEvents>(
    eventName: K,
    callback: BluetoothEvents[K]
  ): EmitterSubscription {
    const subscription = this.eventEmitter.addListener(eventName, callback);
    this.listeners.set(eventName, subscription);
    return subscription;
  }

  /**
   * Hủy lắng nghe một sự kiện cụ thể
   */
  removeEventListener(eventName: keyof BluetoothEvents): void {
    const listener = this.listeners.get(eventName);
    if (listener) {
      listener.remove();
      this.listeners.delete(eventName);
    }
  }

  /**
   * Hủy tất cả listeners
   */
  removeAllListeners(): void {
    this.listeners.forEach(listener => listener.remove());
    this.listeners.clear();
  }
}

export default new BluetoothModuleWrapper();
