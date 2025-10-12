import React, { useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { Box } from './Layout/Box';
import { useTheme } from '@react-navigation/native';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  length = 6,
  error,
  disabled = false,
}: OTPInputProps) {
  const { colors } = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, idx: number) => {
    if (/[^0-9]/.test(text)) return;
    const newValue = value.split('');
    newValue[idx] = text;
    if (text && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
    onChange(newValue.join('').slice(0, length));
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <Box
      flexDirection="row"
      justifyContent="center"
      gap={12}
      mb={error ? 8 : 24}
    >
      {Array.from({ length }).map((_, idx) => (
        <Box
          key={idx}
          border={1}
          borderColor={error ? colors.error : colors.primary}
          borderRadius={32}
          width={50}
          height={50}
          alignItems="center"
          justifyContent="center"
        >
          <TextInput
            ref={ref => {
              inputs.current[idx] = ref;
            }}
            style={styles.input}
            value={value[idx] || ''}
            onChangeText={text => handleChange(text.slice(-1), idx)}
            onKeyPress={e => handleKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!disabled}
            selectTextOnFocus
            textAlign="center"
            placeholder=""
            underlineColorAndroid="transparent"
            autoFocus={idx === 0}
            importantForAutofill="no"
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor={colors.primary}
          />
        </Box>
      ))}
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 28,
    fontWeight: '600',
    width: 56,
    height: 56,
    textAlign: 'center',
    color: '#222',
  },
});
