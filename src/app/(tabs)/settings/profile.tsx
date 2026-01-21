import {Alert, TouchableOpacity, ScrollView, Modal} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Box} from '../../../components/common/Layout/Box';
import ScreenHeader from '../../../components/header/ScreenHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Input from '../../../components/common/TextField/Input';
import Button from '../../../components/common/Button/Button';
import {useForm} from 'react-hook-form';
import TextField from '../../../components/common/TextField/TextField';
import {ProfileForm, profileSchema} from '../../../features/settings/types';
import {zodResolver} from '@hookform/resolvers/zod';
import BluetoothModule from '../../../assets/managers/BluetoothModule';
import {formatName} from '../../../features/chat/utils/formatName';
import {userStore} from '../../../store/userStore';
import {useUpdateUser} from '../../../features/auth/hooks/useUpdateUser';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import {Image} from 'react-native';
import {Camera} from 'lucide-react-native';
import {colors} from '../../../theme/colors';
import {Text} from '../../../components/common/Text/Text';
import {User} from '@/database/entities/User';
import {AVATAR} from '../../../assets/images';

const ProfileScreen = () => {
  const {top, bottom} = useSafeAreaInsets();
  const {user, setUser} = userStore();
  const {mutateAsync: updateUser, isPending} = useUpdateUser();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Default date: 01/01/2003
  const DEFAULT_DATE = dayjs('2003-01-01').toDate();

  const parseDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) ? d : null;
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {isSubmitting},
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: formatName(user?.name || ''),
      email: typeof user?.email === 'string' ? user.email : '',
      image: user?.image || null,
      birthday: parseDate(user?.birthday),
    },
  });

  const selectedBirthday = watch('birthday');
  const selectedImage = watch('image');

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: formatName(user.name || ''),
        email: typeof user.email === 'string' ? user.email : '',
        image: user.image || null,
        birthday: parseDate(user.birthday),
      });
    }
  }, [user, reset]);

  const onPickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.base64
          ? `data:${asset.type};base64,${asset.base64}`
          : asset.uri;

        setValue('image', imageUri as string, {shouldDirty: true});
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const getAvatarSource = React.useMemo(() => {
    if (!selectedImage || typeof selectedImage !== 'string') {
      return AVATAR;
    }

    // If user provided a raw base64 string without scheme, add it
    // Simple check: doesn't start with 'http', 'file', or 'data'
    // Trim to avoid whitespace issues
    const cleanImage = selectedImage.trim();
    if (
      !cleanImage.startsWith('http') &&
      !cleanImage.startsWith('file') &&
      !cleanImage.startsWith('data:')
    ) {
      // Assuming JPEG for raw base64 logic
      return {uri: `data:image/jpeg;base64,${cleanImage}`};
    }

    return {uri: cleanImage};
  }, [selectedImage]);

  const onSubmit = useCallback(
    async (data: ProfileForm) => {
      try {
        if (!user?.id) return;

        // Calculate final name with BLE prefix
        let finalName = data.name;
        if (data.name) {
          const trimmed = data.name.trim();
          // Ensure BLE prefix is present for system consistency
          finalName = trimmed.startsWith('BLE ') ? trimmed : `BLE ${trimmed}`;

          // Silent Bluetooth Auto-Rename
          const currentBleName = await BluetoothModule.getBluetoothName();
          if (currentBleName !== finalName) {
            await BluetoothModule.setBluetoothName(finalName);
          }
        }

        const updatedData: Partial<User> = {
          name: finalName,
          email: data.email,
          image: data.image || undefined,
          birthday: data.birthday
            ? new Date(data.birthday).toISOString()
            : undefined,
        };

        await updateUser({
          id: user.id,
          data: updatedData,
        });

        // Update local store immediately
        if (user) {
          setUser({
            ...user,
            ...updatedData,
          } as User);
        }

        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      } catch (error) {
        console.error('Update profile error:', error);
        Alert.alert('Thất bại', 'Có lỗi xảy ra khi cập nhật');
      }
    },
    [user, updateUser, setUser],
  );

  return (
    <Box flex={1} backgroundColor="white" pt={top}>
      <ScreenHeader title="Thông tin cá nhân" />
      <ScrollView
        contentContainerStyle={{padding: 20, paddingBottom: bottom + 20}}>
        {/* Avatar Section */}
        <Box alignItems="center" mb={30}>
          <TouchableOpacity onPress={onPickImage} activeOpacity={0.8}>
            <Box
              width={100}
              height={100}
              borderRadius={50}
              backgroundColor="#f0f0f0"
              borderWidth={1}
              borderColor="#e0e0e0"
              overflow="hidden"
              justifyContent="center"
              alignItems="center">
              <Image
                source={getAvatarSource}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />

              {/* Camera Icon Overlay */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height={30}
                backgroundColor="rgba(0,0,0,0.3)"
                justifyContent="center"
                alignItems="center">
                <Camera size={16} color="white" />
              </Box>
            </Box>
          </TouchableOpacity>
          <Text
            style={{marginTop: 8, color: colors.primary}}
            onPress={onPickImage}>
            Thay đổi ảnh đại diện
          </Text>
        </Box>

        {/* Inputs */}
        <Box gap={16}>
          <Input
            as={TextField}
            name="name"
            control={control}
            label={'Tên người dùng'}
            placeholder={'Nhập tên hiển thị'}
            required
          />

          <Input
            as={TextField}
            name="email"
            control={control}
            label={'Email'}
            placeholder={'example@email.com'}
            required
            keyboardType="email-address"
          />

          {/* Birthday Picker */}
          <Box>
            <Text style={{marginBottom: 8}} fontWeight="bold" color="#333">
              Ngày sinh
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderRadius: 8,
                padding: 12,
                backgroundColor: '#f9f9f9',
              }}>
              <Text color={selectedBirthday ? '#333' : '#999'}>
                {selectedBirthday
                  ? dayjs(selectedBirthday).format('DD/MM/YYYY')
                  : 'Chọn ngày sinh'}
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>

        <Box mt={30}>
          <Button
            title={'Cập nhật'}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting || isPending}
          />
        </Box>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}>
        <Box
          flex={1}
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="center"
          alignItems="center"
          px={20}>
          <Box
            backgroundColor="white"
            borderRadius={16}
            p={20}
            width="100%"
            maxHeight="80%">
            <DateTimePicker
              mode="single"
              date={
                selectedBirthday
                  ? dayjs(selectedBirthday).toDate()
                  : DEFAULT_DATE
              }
              onChange={params => {
                if (params.date) {
                  setValue('birthday', dayjs(params.date).toDate(), {
                    shouldDirty: true,
                  });
                }
                setShowDatePicker(false);
              }}
            />
            <Box mt={10}>
              <Button title="Đóng" onPress={() => setShowDatePicker(false)} />
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfileScreen;
