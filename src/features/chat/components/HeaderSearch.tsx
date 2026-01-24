import React from 'react';
import {TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {Box} from '@/components/common/Layout/Box';
import {Search, X} from 'lucide-react-native';

interface HeaderSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const HeaderSearch = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm cuộc trò chuyện, thiết bị...',
}: HeaderSearchProps) => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      backgroundColor="#f5f5f5"
      borderRadius={12}
      px={12}
      py={10}
      flex={1}>
      <Search size={18} color="#888" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10}>
          <X size={16} color="#888" />
        </TouchableOpacity>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    padding: 0, // Reset default padding on Android
  },
});
