import {Dimensions, StyleSheet} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Box} from '../../../components/common/Layout/Box';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text} from '../../../components/common/Text/Text';
import {Model} from '../../../features/settings/types';
import {colors} from '../../../theme/colors';
import Button from '../../../components/common/Button/Button';
import {Download, Check} from 'lucide-react-native';
import ScreenHeader from '../../../components/header/ScreenHeader';
import BlueShimmerBar from '../../../features/settings/components/BlueShimmerBar';
import useModelStore from '../../../store/modelStore';
import {ModelDownloader} from '../../../features/settings/components/ModelDownloader';

const width = Dimensions.get('window').width - 75;

const models: Model[] = [
  {id: '1', name: 'LLAMA3_2_1B', size: 2.47},
  {id: '2', name: 'LLAMA3_2_1B_SPINQUANT', size: 1.14},
  {id: '3', name: 'LLAMA3_2_1B_QLORA', size: 1.18},
  {id: '4', name: 'LLAMA3_2_3B', size: 6.43},
  {id: '5', name: 'LLAMA3_2_3B_SPINQUANT', size: 2.55},
  {id: '6', name: 'LLAMA3_2_3B_QLORA', size: 2.65},
];

const ModelScreen = () => {
  const {top} = useSafeAreaInsets();
  const {getModelStatus, activeModel, setActiveModel} = useModelStore();
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});
  const [completedModels, setCompletedModels] = useState<Set<string>>(
    new Set(),
  );

  const handleDownload = (item: Model) => {
    const status = getModelStatus(item.name);
    if(status){
      setActiveModel(item.name)
      return;
    }
    setDownloadingModel(item.name);
  };

  const handleProgressUpdate = (modelName: string, progress: number) => {
    setDownloadProgress(prev => ({
      ...prev,
      [modelName]: progress,
    }));
  };

  const handleDownloadComplete = (modelName: string) => {
    console.log(`Download completed for model: ${modelName}`);
    setCompletedModels(prev => new Set([...prev, modelName]));
    setDownloadingModel(null);
  };

  const renderModel = (item: Model) => {
    const isDownloading = downloadingModel === item.name;
    const progress = downloadProgress[item.name] || 0;
    const isCompleted = completedModels.has(item.name);
    const isDownloaded = getModelStatus(item.name);
    return (
      <Box
        key={item.id}
        backgroundColor={'white'}
        p={5}
        style={activeModel === item.name ? styles.active : {}}
        onPress={() => handleDownload(item)}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb={5}>
          <Box flex={1}>
            <Text fontSize={14} fontWeight="medium">
              {item.name}
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
            <Text fontSize={14} fontWeight="medium">
              {item.size} GB
            </Text>
            <Button
              icon={
                <Box alignItems="center" justifyContent="center">
                  {isCompleted || isDownloaded
                    ? !isDownloading && <Check color={colors.white} />
                    : !isDownloading && <Download color={colors.white} />}
                </Box>
              }
              onPress={() => handleDownload(item)}
              isLoading={isDownloading}
              disabled={
                isCompleted ||
                (downloadingModel !== null && !isDownloading) ||
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
      <ScreenHeader title="Mô hình" mt={top} isShowBackButton={true} />
      <Box mb={10}>
        <Text fontSize={16} fontWeight="bold">
          Danh sách mô hình
        </Text>
      </Box>
      <Box backgroundColor={colors.white} borderRadius={20} p={10} gap={10}>
        {models.map(model => renderModel(model))}
      </Box>

      {/* Component ẩn để quản lý download */}
      {downloadingModel && (
        <ModelDownloader
          modelName={downloadingModel}
          onProgressUpdate={progress =>
            handleProgressUpdate(downloadingModel, progress)
          }
          onComplete={() => handleDownloadComplete(downloadingModel)}
        />
      )}
    </Box>
  );
};

export default ModelScreen;

const styles = StyleSheet.create({
  active: {
    borderRadius: 10,
    borderColor: colors.skyBlueLight,
    borderWidth: 2,
  },
});
