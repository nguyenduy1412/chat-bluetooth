import React from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from '../common/Layout/Box';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '../common/Text/Text';
import { goBack } from '../../utils/navigationUtils';


interface ScreenHeaderProps {
  mt?: number;
  title?: string;
  rightComponent?: React.ReactNode;
  isShowBackButton?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  mt = 20,
  title,
  rightComponent,
  isShowBackButton = true,
}) => {
  const onBack = () => {
    goBack();
  };

  return (
    <Box flexDirection={'row'} alignItems="center" mt={mt} >
      <Box flexDirection="row" alignItems="center" flex={1}>
        {isShowBackButton && (
          <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft />
          </TouchableOpacity>
        )}
        {title && (
          <Box py={6} px={isShowBackButton ? 0 : 12} >
            <Text fontSize={20} fontWeight="medium">
              {title}
            </Text>
          </Box>
        )}
      </Box>
      {rightComponent && (
        <Box py={6} px={20}>
          {rightComponent}
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
});

export default ScreenHeader;
