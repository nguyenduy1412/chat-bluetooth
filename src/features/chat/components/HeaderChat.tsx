import {Box} from '@/components/common/Layout/Box';
import React, {memo} from 'react';
import {Text} from '@/components/common/Text/Text';
import {ChevronLeft, Search} from 'lucide-react-native';
import {useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {goBack} from '@/utils/navigationUtils';
import {Image} from 'react-native';
import {AI_3, AVATAR} from '@/assets/images';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  avatar?: string;
  name?: string;
  type?: 'user' | 'ai';
  onSearch?: () => void;
};
const HeaderChat = ({avatar, name, onSearch, type = 'user'}: Props) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#4FACFE', '#00C6FB']}
      style={{
        paddingTop: insets.top + 10,
        paddingBottom: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Box flexDirection="row" alignItems="center" gap={10}>
        <Box onPress={goBack}>
          <ChevronLeft color={colors.background} />
        </Box>
        <Box>
          <Image
            source={
              avatar && avatar.length > 10
                ? {uri: avatar}
                : type === 'ai'
                ? AI_3
                : AVATAR
            }
            style={{width: 40, height: 40, borderRadius: 999}}
          />
        </Box>
        <Box>
          <Text fontSize={20} color={colors.background}>
            {name}
          </Text>
        </Box>
      </Box>
      <Box>
        <Search color={colors.background} onPress={onSearch} />
      </Box>
    </LinearGradient>
  );
};

export default memo(HeaderChat);
