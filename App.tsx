/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import React from 'react';
import type {PropsWithChildren} from 'react';
import {ScrollView, StatusBar, Text, useColorScheme, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import RootNavigation from './src/components/navigation/RootNavigation';
import initI18n from './src/i18n/config';

initI18n();
function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <BottomSheetModalProvider>
        <RootNavigation />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default App;
