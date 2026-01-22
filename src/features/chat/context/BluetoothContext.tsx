import React, {createContext, useContext, ReactNode} from 'react';
import {useBluetooth} from '../hooks/useBluetooth';

type BluetoothContextType = ReturnType<typeof useBluetooth>;

const BluetoothContext = createContext<BluetoothContextType | null>(null);

type BluetoothProviderProps = {
  children: ReactNode;
  isDatabaseReady: boolean;
};

export const BluetoothProvider = ({
  children,
  isDatabaseReady,
}: BluetoothProviderProps) => {
  const bluetooth = useBluetooth({isDatabaseReady});

  return (
    <BluetoothContext.Provider value={bluetooth}>
      {children}
    </BluetoothContext.Provider>
  );
};

/**
 * Hook để sử dụng Bluetooth context
 * Chỉ dùng hook này thay vì gọi useBluetooth() trực tiếp
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
