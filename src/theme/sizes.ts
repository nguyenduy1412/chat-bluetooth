import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const sizes = {
  base: 8,
  padding: 14,
  margin: 16,
  radius: 10,
  radius35: 35,
  gap: 10,
  width,
  height,
};

export default sizes;
