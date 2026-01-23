import {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Message} from '../../types/types';
import BluetoothModule from '../../assets/managers/BluetoothModule';
import {requestPermissions} from '../../utils/permission';
import {Box} from '../../components/common/Layout/Box';
import {navigate} from '../../utils/navigationUtils';
import StartLogo from '../../components/common/StartLogo';

// Interface cho device
interface BluetoothDevice {
  name: string;
  address: string;
  bondState: 'BONDED' | 'BONDING' | 'NONE' | 'UNKNOWN';
}

interface ConnectedDevice {
  name: string;
  address: string;
}

interface ReceivingImageChunks {
  id: string;
  text: string;
  status: 'receiving' | 'completed' | 'failed';
}
const defaultReceivingImageChunks: ReceivingImageChunks = {
  id: '',
  text: '',
  status: 'receiving',
};
const HomeScreen = () => {
  const {top, bottom} = useSafeAreaInsets();

  // Giao diện kết nối
  return (
    <Box style={[styles.container, {paddingTop: top, paddingBottom: bottom}]}>
      <StartLogo />
    </Box>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  deviceAddr: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  bondState: {
    fontSize: 11,
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Chat styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  chatSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  connectedDevicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  connectedDeviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  connectedDeviceText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  disconnectButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
  },
  messagesContent: {
    padding: 16,
  },
  messageItem: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButtonText: {
    fontSize: 24,
  },
  // File message styles
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  fileIcon: {
    fontSize: 32,
    color: '#666',
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  fileStatus: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  // Image message styles
  imageMessage: {
    maxWidth: '85%',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
});
