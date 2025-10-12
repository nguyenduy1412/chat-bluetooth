import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Text } from '../Text/Text';
import { Box } from '../Layout/Box';
import sizes from '../../../theme/sizes';
import { colors } from '../../../theme/colors';

const dataFake = [
  { id: '1', title: 'Bug Report' },
  { id: '2', title: 'Feature Request' },
  { id: '3', title: 'UX/UI Feedback' },
  { id: '4', title: 'Connection Issues' },
  { id: '5', title: 'Privacy/Safety Concern' },
  { id: '6', title: 'Other' },
];


type DropDownProps = {
  data?: any[];
  onSelected?: (item: string) => void;
  selected?: string | null;
  placeholder?: string;
  label?: string;
  required?: boolean;
  getValue?: string;
  getLable?: string;
  maxHeight?: number;
  error?: string;
};

const DropDown: React.FC<DropDownProps> = React.memo(({
  data = dataFake,
  onSelected,
  selected,
  placeholder = 'Select one',
  label,
  required = false,
  getValue = 'id',
  getLable = 'title',
  maxHeight = 360,
  error,
}) => {
  const { colors } = useTheme();
  const renderItem = (item: any) => {
    const isLast = data[data.length - 1][getValue] === item[getValue];
    return (
      <View style={[styles.item, !isLast && { borderBottomWidth: 1 }]}>
        <Text>{item[getLable]}</Text>
      </View>
    );
  };
  const renderChevronIcon = React.useCallback((isOpen?: boolean) => (
    <Box pr={6}>
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </Box>
  ), []);
  return (
    <Box pb={sizes.margin}>
      {label && <Text style={{ paddingBottom: 8 }} >{(required ? `* ` : '') + label}</Text>}
      <Dropdown
        style={[styles.dropdown,error && { borderColor: colors.error }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.textItem}
        data={data}
        labelField={getLable}
        valueField={getValue}
        placeholder={placeholder}
        value={selected}
        maxHeight={maxHeight}
        onChange={(item: any) => {
          onSelected && onSelected(item.id);
        }}
        renderItem={renderItem}
        containerStyle={{ borderRadius: 12 }}
        renderRightIcon={renderChevronIcon}
      />
      {error ? (
        <Text style={{ color: colors.error, marginTop: 4 }}>{error}</Text>
      ) : null}
    </Box>

  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 40,
    borderColor: colors.grayScale[10],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    color: colors.grayScale[40],
    paddingLeft: 8,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  item: {
    padding: 10,
    borderBottomColor: colors.grayScale[10],
  },
  textItem: {
    paddingLeft: 6,
    fontSize: 14,
  },
});

export default DropDown;