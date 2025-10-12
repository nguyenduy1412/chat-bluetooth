import {Image, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import {Box} from '../../../components/common/Layout/Box';

type ImageProps = {
  visible: boolean;
  onClose: () => void;
  item?: string;
};

const ImageModal: React.FC<ImageProps> = ({visible, onClose, item}) => {
  if (!item) return null;

  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={800}
      animationOutTiming={500}>
      <Box onPress={onClose}>
        <Image
          source={{uri: item}}
          style={[
            styles.image,
            {
              width: screenWidth * 0.95,
              height: screenHeight,
            },
          ]}
        />
      </Box>
    </Modal>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  image: {
    resizeMode: 'contain',
    borderRadius: 10,
  },
});
