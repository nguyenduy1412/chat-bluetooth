
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates } from '../types/types';

type State = {
  locationCurrent: Coordinates;
  setLocationCurrent: (locationCurrent: Coordinates) => void;
};

export const locationStore = create<State, [['zustand/persist', State]]>(
  persist(
    set => ({
      
      locationCurrent: { lat: 20.997818, lng: 105.79554, heading: 0 },
      setLocationCurrent: (locationCurrent: Coordinates) => set({ locationCurrent }),
     
    }),
    {
      name: 'locationStore',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
