/**
 * Sample React Native App
 * https:
 *
 * @format
 */

import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import RootNavigation from './src/components/navigation/RootNavigation';
import initI18n from './src/i18n/config';
import {LLMProvider} from './src/components/provider/LLMProvider';
import { initDatabase } from './src/database/dataSource';
import 'react-native-get-random-values';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/lib/react-query';
initI18n();

function App(): React.JSX.Element {
  useEffect(() => {
    initDatabase()
      .then(() => console.log('✅ Database initialized'))
      .catch(error => console.error('❌ Database init error:', error));
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <LLMProvider>
          <BottomSheetModalProvider>
            <RootNavigation />
          </BottomSheetModalProvider>
        </LLMProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
