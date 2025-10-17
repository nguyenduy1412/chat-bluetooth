import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = '@user_profile';

type ProfileState = {
  name: string;
  email: string;
  loadProfile: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const useProfileStore = create<ProfileState>((set, get) => ({
  name: '',
  email: '',

  // Load profile từ AsyncStorage
  loadProfile: async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const { name, email } = JSON.parse(storedProfile);
        set({ name: name || '', email: email || '' });
      }
    } catch (error) {
      console.error('Error loading profile from AsyncStorage:', error);
    }
  },

  // Cập nhật name
  updateName: async (name: string) => {
    try {
      const { email } = get();
      const profile = { name, email };
      set({ name });
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error updating name to AsyncStorage:', error);
    }
  },

  // Cập nhật email
  updateEmail: async (email: string) => {
    try {
      const { name } = get();
      const profile = { name, email };
      set({ email });
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error updating email to AsyncStorage:', error);
    }
  },

  // Cập nhật cả name và email cùng lúc
  updateProfile: async (name: string, email: string) => {
    try {
      const profile = { name, email };
      set({ name, email });
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error updating profile to AsyncStorage:', error);
    }
  },

  // Xóa profile (optional - useful cho logout)
  clearProfile: async () => {
    try {
      set({ name: '', email: '' });
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing profile from AsyncStorage:', error);
    }
  },
}));

export default useProfileStore;
