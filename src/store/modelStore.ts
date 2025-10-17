import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ModelInfo ={
    name: string;
    status: boolean;
}

type ModelState = {
  models: ModelInfo[];
  loadModels: () => Promise<void>;
  getModelStatus: (name: string) => boolean | undefined;
  setModelStatus: (name: string, status: boolean) => Promise<void>;
  activeModel: string;
  setActiveModel: (name: string) => Promise<void>;
};

const MODEL_STORAGE_KEY = '@model_list';
const ACTIVE_MODEL = 'active_model'
const defaultModels: ModelInfo[] = [
  { name: 'LLAMA3_2_1B', status: false },
  { name: 'LLAMA3_2_1B_SPINQUANT', status: false },
  { name: 'LLAMA3_2_1B_QLORA', status: false },
  { name: 'LLAMA3_2_3B', status: false },
  { name: 'LLAMA3_2_3B_SPINQUANT', status: false },
  { name: 'LLAMA3_2_3B_QLORA', status: false }
];

const useModelStore = create<ModelState>((set, get) => ({
    models: defaultModels,
    activeModel: '',
    setActiveModel: async (name: string) => {
        set({ activeModel: name });
        await AsyncStorage.setItem(ACTIVE_MODEL,name);
    },
    loadModels: async () => {
      try {
        const storedModels = await AsyncStorage.getItem(MODEL_STORAGE_KEY);
        if (storedModels) {
          const parsedModels = JSON.parse(storedModels);
          set({ models: parsedModels });
        } else {
          await AsyncStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(defaultModels));
        }

        const storedActiveModel = await AsyncStorage.getItem(ACTIVE_MODEL);
        if (storedActiveModel) {
          set({ activeModel: storedActiveModel });
        }
      } catch (error) {
        console.error('Error loading models from AsyncStorage:', error);
      }
    },
    
    getModelStatus: (name: string) => {
      const model = get().models.find(m => m.name === name);
      return model?.status;
    },
    
    setModelStatus: async (name: string, status: boolean) => {
      try {
        const currentModels = get().models;
        const updatedModels = currentModels.map(model => 
          model.name === name ? { ...model, status } : model
        );
        set({ models: updatedModels });
        await AsyncStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(updatedModels));
      } catch (error) {
        console.error('Error saving model status to AsyncStorage:', error);
      }
    },
}) );

export default useModelStore;