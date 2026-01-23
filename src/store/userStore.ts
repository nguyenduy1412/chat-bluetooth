import {create} from 'zustand';
import {createJSONStorage, persist, StateStorage} from 'zustand/middleware';
import {User} from '@/database/entities/User';
import {createMMKV} from 'react-native-mmkv';
type State = {
  user?: User | null;
  setUser: (user: User | null) => void;
  isEnableBluetooth: boolean;
  setIsEnableBluetooth: (isEnableBluetooth: boolean) => void;
};
const userStorage = createMMKV({
  id: 'user-storage',
});
const zustandUserStorage: StateStorage = {
  setItem: (name, value) => {
    userStorage.set(name, value);
  },
  getItem: name => {
    return userStorage.getString(name) ?? null;
  },
  removeItem: name => {
    userStorage.remove(name);
  },
};
export const userStore = create<State, [['zustand/persist', State]]>(
  persist(
    set => ({
      user: null,
      setUser: (user: User | null) => set({user}),
      isEnableBluetooth: false,
      setIsEnableBluetooth: (isEnableBluetooth: boolean) =>
        set({isEnableBluetooth}),
    }),
    {
      name: 'userStore',
      storage: createJSONStorage(() => zustandUserStorage),
    },
  ),
);
