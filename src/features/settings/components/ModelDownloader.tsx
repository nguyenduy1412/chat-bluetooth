import { useEffect } from "react";
import { LLAMA3_2_1B, LLAMA3_2_1B_QLORA, LLAMA3_2_1B_SPINQUANT, LLAMA3_2_3B, LLAMA3_2_3B_QLORA, LLAMA3_2_3B_SPINQUANT, useLLM } from "react-native-executorch";
import useModelStore from "../../../store/modelStore";

export const ModelDownloader = ({
  modelName,
  onProgressUpdate,
  onComplete,
}: {
  modelName: string;
  onProgressUpdate: (progress: number) => void;
  onComplete: (isReady: boolean) => void;
}) => {
  const { setModelStatus } = useModelStore();
  const getModelSource = () => {
    switch (modelName) {
      case 'LLAMA3_2_1B':
        return LLAMA3_2_1B;
      case 'LLAMA3_2_1B_SPINQUANT':
        return LLAMA3_2_1B_SPINQUANT;
      case 'LLAMA3_2_1B_QLORA':
        return LLAMA3_2_1B_QLORA;
      case 'LLAMA3_2_3B':
        return LLAMA3_2_3B;
      case 'LLAMA3_2_3B_SPINQUANT':
        return LLAMA3_2_3B_SPINQUANT;
      case 'LLAMA3_2_3B_QLORA':
        return LLAMA3_2_3B_QLORA;
      default:
        return null;
    }
  };

  const modelSource = getModelSource();
  const llm = modelSource ? useLLM({model: modelSource}) : null;
  console.log('LLM Instance:', llm?.downloadProgress);
  useEffect(() => {
    if (llm) {
      onProgressUpdate(llm.downloadProgress);
      if (llm.isReady) {
        onComplete(true);
        setModelStatus(modelName,true);
      }
    }
  }, [llm?.downloadProgress, llm?.isReady]);

  return null;
};