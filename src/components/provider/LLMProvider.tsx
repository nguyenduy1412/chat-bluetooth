import React, {createContext, useContext, useEffect, useState, useRef} from 'react';
import {
  useLLM,
  LLAMA3_2_1B_SPINQUANT,
} from 'react-native-executorch';

const LLMContext = createContext<any | null>(null);

// Fix cứng model để tránh re-render và lỗi unload
const SELECTED_MODEL = LLAMA3_2_1B_SPINQUANT;

export const LLMProvider = ({children}: {children: React.ReactNode}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitialized = useRef(false);

  console.log('🚀 LLMProvider using fixed model:', SELECTED_MODEL);
  // const llm = useLLM({model: SELECTED_MODEL});
  const llm = null;
  // console.log('🚀 LLMProvider rendered, LLM isReady:', llm.isReady);

  // useEffect(() => {
  //   // Chỉ initialize một lần
  //   if (llm && !hasInitialized.current) {
  //     hasInitialized.current = true;
  //     setIsInitialized(true);
  //     console.log('🚀 LLM initialized successfully');
  //   }
  // }, [llm]);

  // Nếu chưa initialized, return null context để tránh lỗi
  const contextValue = isInitialized ? llm : null;

  return <LLMContext.Provider value={contextValue}>{children}</LLMContext.Provider>;
};

export const useLLMContext = () => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error('useLLMContext must be used within LLMProvider');
  }
  return context;
};
