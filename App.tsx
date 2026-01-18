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
import {initDatabase} from './src/database/dataSource';

initI18n();

function App(): React.JSX.Element {
  useEffect(() => {
    // Khởi tạo database 1 lần duy nhất khi app start
    initDatabase()
      .then(() => console.log('✅ Database initialized'))
      .catch(error => console.error('❌ Database init error:', error));
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <LLMProvider>
        <BottomSheetModalProvider>
          <RootNavigation />
        </BottomSheetModalProvider>
      </LLMProvider>
    </GestureHandlerRootView>
  );
}

export default App;
