import React from 'react';
import { ScrollView, type ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { Box } from './Layout/Box';
import { Text } from './Text/Text';
import { FontSize } from '../../theme/fonts';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

type WheelPickerProps = {
  data: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  style?: ViewStyle;
};

const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedIndex,
  onIndexChange,
  style,
}) => {
  const { colors } = useTheme();

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const targetY = selectedIndex * ITEM_HEIGHT;
    scrollViewRef.current?.scrollTo({ y: targetY, animated: false });
  }, [selectedIndex]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrollY(y);
  };

  const handleScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

    if (clampedIndex !== selectedIndex) {
      onIndexChange(clampedIndex);
    }

    scrollViewRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  const renderItem = (item: string, index: number) => {
    const offset = scrollY - index * ITEM_HEIGHT;
    const distance = Math.abs(offset);
    const scale = Math.max(0.8, 1 - distance / (ITEM_HEIGHT * 2));
    const opacity = Math.max(0.3, 1 - distance / (ITEM_HEIGHT * 1.5));

    return (
      <Box
        key={index}
        height={ITEM_HEIGHT}
        justifyContent="center"
        alignItems="center"
        style={{
          transform: [{ scale }],
          opacity,
        }}
      >
        <Text
          fontSize={FontSize.MEDIUM}
          fontWeight={'normal'}
          color={index === selectedIndex ? colors.text : colors.textTertiary}
        >
          {item}
        </Text>
      </Box>
    );
  };

  const paddingVertical = ((VISIBLE_ITEMS - 1) * ITEM_HEIGHT) / 2;

  return (
    <Box height={VISIBLE_ITEMS * ITEM_HEIGHT} style={style}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical,
        }}
      >
        {data.map(renderItem)}
      </ScrollView>
      <Box
        position="absolute"
        top={((VISIBLE_ITEMS - 1) * ITEM_HEIGHT) / 2}
        left={0}
        right={0}
        height={ITEM_HEIGHT}
        borderTopWidth={1}
        borderBottomWidth={1}
        borderColor={colors.palette.grayScale[20]}
        pointerEvents="none"
      />
    </Box>
  );
};

export default WheelPicker;
