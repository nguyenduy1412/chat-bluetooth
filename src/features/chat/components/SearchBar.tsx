import React, {useEffect, useRef} from 'react';
import {
  TextInput,
  StyleSheet,
  Animated,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {Box} from '@/components/common/Layout/Box';
import {Text} from '@/components/common/Text/Text';
import {colors} from '@/theme/colors';
import {X, ChevronUp, ChevronDown} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchBarProps = {
  visible: boolean;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onClose: () => void;
  currentIndex: number;
  totalResults: number;
  onPrevious: () => void;
  onNext: () => void;
};

const SearchBar = ({
  visible,
  searchText,
  onSearchTextChange,
  onClose,
  currentIndex,
  totalResults,
  onPrevious,
  onNext,
}: SearchBarProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const inputRef = useRef<TextInput>(null);
    const insets = useSafeAreaInsets();
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -100,
      duration: 250,
      useNativeDriver: true,
    }).start();

    if (visible) {
      // Dismiss keyboard hiện tại trước
      Keyboard.dismiss();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <Box
        flexDirection="row"
        alignItems="center"
        backgroundColor={colors.white}
        borderBottomWidth={1}
        borderBottomColor={colors.divider}
        px={16}
        py={12}
        gap={12}
        pt={insets.top + 12}
        >
        {/* Search Input */}
        <Box
          flex={1}
          backgroundColor="#F0F0F0"
          borderRadius={8}
          px={12}
          py={8}
          flexDirection="row"
          alignItems="center">
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={searchText}
            onChangeText={onSearchTextChange}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor="#999"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchTextChange('')}
              style={styles.clearButton}>
              <X size={16} color="#999" />
            </TouchableOpacity>
          )}
        </Box>

        {/* Results Counter & Navigation */}
        {totalResults > 0 && (
          <Box flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={12} color="#666">
              {currentIndex + 1}/{totalResults}
            </Text>
            <Box flexDirection="row" gap={4}>
              <TouchableOpacity
                onPress={onPrevious}
                disabled={totalResults === 0}
                style={[
                  styles.navButton,
                  totalResults === 0 && styles.navButtonDisabled,
                ]}>
                <ChevronUp size={18} color={totalResults > 0 ? colors.primary : '#ccc'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onNext}
                disabled={totalResults === 0}
                style={[
                  styles.navButton,
                  totalResults === 0 && styles.navButtonDisabled,
                ]}>
                <ChevronDown size={18} color={totalResults > 0 ? colors.primary : '#ccc'} />
              </TouchableOpacity>
            </Box>
          </Box>
        )}

        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  navButton: {
    padding: 4,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  closeButton: {
    padding: 4,
  },
});

export default SearchBar;
