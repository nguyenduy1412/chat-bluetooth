/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {ScrollView, StatusBar, Text, useColorScheme, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import RootNavigation from './src/components/navigation/RootNavigation';
import initI18n from './src/i18n/config';
import {LLMProvider} from './src/components/provider/LLMProvider';
import {
  initDatabase,
  deleteAndRecreateDatabase,
} from './src/database/dataSource';
import 'react-native-get-random-values';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/lib/react-query';
initI18n();

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize database without deleting existing data
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
