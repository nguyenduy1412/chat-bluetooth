import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Alert, FlatList} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {Box} from '../../../components/common/Layout/Box';
import {Text} from '../../../components/common/Text/Text';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Button from '../../../components/common/Button/Button';
import {Download, Check} from 'lucide-react-native';
import ScreenHeader from '../../../components/header/ScreenHeader';
import BlueShimmerBar from '../../../features/settings/components/BlueShimmerBar';
import {colors} from '../../../theme/colors';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiZHV5MTQxMiIsImEiOiJjbWd0OW5wNDIwMjJyMm5uYWowdzVsMzRiIn0.GBkouLsk82Z-OEdglK-I_Q',
);

const width = Dimensions.get('window').width - 75;

interface Province {
  id: string;
  name: string;
  bounds: [[number, number], [number, number]];
}

const provinces: Province[] = [
  {
    id: '1',
    name: 'Hà Nội',
    bounds: [
      [105.7, 20.9],
      [105.95, 21.15],
    ],
  },
  {
    id: '2',
    name: 'Hải Phòng',
    bounds: [
      [106.6, 20.8],
      [106.85, 20.95],
    ],
  },
  {
    id: '3',
    name: 'Quảng Ninh',
    bounds: [
      [106.5, 20.85],
      [108.0, 21.6],
    ],
  },
  {
    id: '4',
    name: 'Hải Dương',
    bounds: [
      [106.2, 20.85],
      [106.5, 21.0],
    ],
  },
  {
    id: '5',
    name: 'Hưng Yên',
    bounds: [
      [105.9, 20.6],
      [106.15, 20.85],
    ],
  },
  {
    id: '6',
    name: 'Bắc Ninh',
    bounds: [
      [106.0, 21.05],
      [106.25, 21.25],
    ],
  },
  {
    id: '7',
    name: 'Thái Nguyên',
    bounds: [
      [105.6, 21.4],
      [106.15, 21.75],
    ],
  },
  {
    id: '8',
    name: 'Vĩnh Phúc',
    bounds: [
      [105.4, 21.2],
      [105.75, 21.45],
    ],
  },
  {
    id: '9',
    name: 'Phú Thọ',
    bounds: [
      [104.9, 21.15],
      [105.45, 21.6],
    ],
  },
  {
    id: '10',
    name: 'Nam Định',
    bounds: [
      [105.95, 20.15],
      [106.50, 20.60],
    ],
  },
  {
    id: '11',
    name: 'Ninh Bình',
    bounds: [
      [105.75, 20.15],
      [106.15, 20.45],
    ],
  },
  {
    id: '12',
    name: 'Hòa Bình',
    bounds: [
      [104.9, 20.6],
      [105.55, 21.0],
    ],
  },
];

const ListMapScreen: React.FC = () => {
  const {top} = useSafeAreaInsets();
  const [downloadingProvince, setDownloadingProvince] = useState<string | null>(
    null,
  );
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});
  const [completedProvinces, setCompletedProvinces] = useState<Set<string>>(
    new Set(),
  );
  const [downloadedProvinces, setDownloadedProvinces] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const checkDownloadedPacks = async () => {
      try {
        const packs = await Mapbox.offlineManager.getPacks();
        console.log('Total packs found:', packs.length);
        const downloaded = new Set<string>();

        for (const pack of packs) {
          try {
            const status = await pack.status();

            if (status?.percentage === 100) {
              if (pack.name === 'hanoi-offline-pack') {
                downloaded.add('Hà Nội');
              }

              const match = pack.name.match(/province-(.+)-offline/);
              if (match) {
                const provinceName = match[1];
                console.log('Found completed province:', provinceName);
                downloaded.add(provinceName);
              }
            }
          } catch (e) {
            console.error('Error checking pack status:', e);
          }
        }

        setDownloadedProvinces(downloaded);
        setCompletedProvinces(downloaded);
      } catch (e) {
        console.error('Error getting packs:', e);
      }
    };
    checkDownloadedPacks();
  }, []);

  const handleDownload = (province: Province) => {
    const isDownloaded = downloadedProvinces.has(province.name);
    if (isDownloaded) {
      return;
    }
    setDownloadingProvince(province.id);
    downloadProvinceMap(province);
  };

  const downloadProvinceMap = async (province: Province): Promise<void> => {
    const packName = `province-${province.name}-offline`;

    const options = {
      name: packName,
      styleURL: Mapbox.StyleURL.Street,
      minZoom: 10,
      maxZoom: 16,
      bounds: province.bounds,
      metadata: {
        province: province.name,
        desc: `Offline map for ${province.name}`,
      },
    };

    const progressListener = (_offlineRegion: any, status: any): void => {
      const percent: number = status?.percentage ?? 0;
      setDownloadProgress(prev => ({
        ...prev,
        [province.id]: percent / 100,
      }));

      if (percent === 100) {
        setCompletedProvinces(prev => new Set([...prev, province.name]));
        setDownloadedProvinces(prev => new Set([...prev, province.name]));
        setDownloadingProvince(null);
      }
    };

    const errorListener = (_offlineRegion: any, error: Error): void => {
      setDownloadingProvince(null);
      Alert.alert('Lỗi tải bản đồ', error.message);
    };

    try {
      await Mapbox.offlineManager.createPack(
        options,
        progressListener,
        errorListener,
      );
    } catch (err) {
      setDownloadingProvince(null);
      Alert.alert('Lỗi', (err as Error).message);
    }
  };

  const renderProvince = (province: Province) => {
    const isDownloading = downloadingProvince === province.id;
    const progress = downloadProgress[province.id] || 0;
    const isCompleted = completedProvinces.has(province.name);
    const isDownloaded = downloadedProvinces.has(province.name);

    return (
      <Box
        key={province.id}
        backgroundColor="white"
        p={5}
        onPress={() => handleDownload(province)}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb={5}>
          <Box flex={1}>
            <Text fontSize={14} fontWeight="medium">
              {province.name}
            </Text>
            {isDownloading && (
              <Box mt={5}>
                <Text fontSize={12} color={colors.textSecondary}>
                  Đang tải... {Math.round(progress * 100)}%
                </Text>
              </Box>
            )}
            {isCompleted && (
              <Box mt={5}>
                <Text fontSize={12} color={colors.green}>
                  ✓ Đã tải xong
                </Text>
              </Box>
            )}
          </Box>
          <Box flexDirection="row" gap={10} alignItems="center">
            <Button
              icon={
                <Box alignItems="center" justifyContent="center">
                  {isCompleted || isDownloaded
                    ? !isDownloading && <Check color={colors.white} />
                    : !isDownloading && <Download color={colors.white} />}
                </Box>
              }
              onPress={() => handleDownload(province)}
              isLoading={isDownloading}
              disabled={
                isCompleted ||
                (downloadingProvince !== null && !isDownloading) ||
                isDownloaded
              }
              style={{
                width: 50,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
                backgroundColor:
                  isCompleted || isDownloaded ? colors.green : colors.skyBlue,
              }}
            />
          </Box>
        </Box>
        {isDownloading && <BlueShimmerBar w={width} />}
        {isCompleted && (
          <Box
            width={width}
            height={4}
            backgroundColor={colors.green}
            borderRadius={6}
          />
        )}
      </Box>
    );
  };

  return (
    <Box flex={1} px={20}>
      <ScreenHeader title="Bản đồ" mt={top} isShowBackButton={true} />
      <Box mb={10}>
        <Text fontSize={16} fontWeight="medium">
          Các tỉnh miền Bắc
        </Text>
      </Box>
      <Box backgroundColor={colors.white} borderRadius={20} p={10} gap={10}>
        <FlatList
          data={provinces}
          renderItem={({item}) => renderProvince(item)}
          keyExtractor={item => item.id}
        />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({});

export default ListMapScreen;
