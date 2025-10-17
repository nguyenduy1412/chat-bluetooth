import {Alert, StyleSheet, Text, View} from 'react-native';
import React, { useCallback } from 'react';
import {Box} from '../../../components/common/Layout/Box';
import ScreenHeader from '../../../components/header/ScreenHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Input from '../../../components/common/TextField/Input';
import Button from '../../../components/common/Button/Button';
import {translate} from '../../../i18n/translate';
import { useForm } from 'react-hook-form';
import TextField from '../../../components/common/TextField/TextField';
import { ProfileForm, profileFormDefaultValues, profileSchema } from '../../../features/settings/types';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import useProfileStore from '../../../store/profileStore';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import { formatName } from '../../../features/chat/utils/formatName';

const ProfileScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  const { updateProfile,loadProfile,name,email } = useProfileStore();
  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: formatName(name),
        email
    },
  });
  
  const {t} = useTranslation();
  const onSubmit = useCallback(async (data: ProfileForm) => {
    console.log('Profile data:', data);
    const result = await BluetoothModule.setBluetoothName(data.name);
    updateProfile('BLE'+data.name ,data.email);
    Alert.alert('Thành công')
  }, []);
  
  return (
    <Box px={20} flex={1} pt={top}>
      <ScreenHeader title="Thông tin cá nhân" />
      <Box justifyContent="center" alignItems="center">
        <Input
          as={TextField}
          name="name"
          control={control}
          label={'Tên người dùng'}
          placeholder={'Nhập tên người dùng'}
          multiline
          numberOfLines={1}
          required
        />
        <Input
          as={TextField}
          name="email"
          control={control}
          label={'Email'}
          placeholder={'Nhập email'}
          multiline
          numberOfLines={1}
          required
        />

        <Button
          title={'Cập nhật'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
        />
      </Box>
    </Box>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
