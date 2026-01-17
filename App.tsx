import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import RootNavigation from './src/components/navigation/RootNavigation';
import initI18n from './src/i18n/config';
import {LLMProvider} from './src/providers/LLMProvider';

initI18n();
function App(): React.JSX.Element {
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
