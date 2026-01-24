import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {useBluetooth} from '../hooks/useBluetooth';
import {ensureDatabase} from '@/database/dataSource';

type BluetoothContextType = ReturnType<typeof useBluetooth> & {
  isDatabaseReady: boolean;
};

const BluetoothContext = createContext<BluetoothContextType | null>(null);

type BluetoothProviderProps = {
  children: ReactNode;
};

export const BluetoothProvider = ({children}: BluetoothProviderProps) => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  // Khởi tạo database
  useEffect(() => {
    const initDb = async () => {
      try {
        await ensureDatabase();
        console.log('✅ Database ready (from BluetoothProvider)');
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('❌ Database init error:', error);
      }
    };
    initDb();
  }, []);

  const bluetooth = useBluetooth({isDatabaseReady});

  return (
    <BluetoothContext.Provider value={{...bluetooth, isDatabaseReady}}>
      {children}
    </BluetoothContext.Provider>
  );
};

/**
 * Hook để sử dụng Bluetooth context
 * Dùng hook này thay vì gọi useBluetooth() trực tiếp trong các component con
 */
export const useBluetoothContext = (): BluetoothContextType => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error(
      'useBluetoothContext must be used within a BluetoothProvider',
    );
  }
  return context;
};
