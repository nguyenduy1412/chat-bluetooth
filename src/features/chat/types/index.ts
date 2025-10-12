export interface CustomMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: string | number;
    name?: string;
    avatar?: string;
  };
  image?: string;
  system?: boolean;
  width?: number;
  height?: number;
};

export interface CustomChatViewProps {
  messages: CustomMessage[];
  currentUserId: string | number;
  currentUserName?: string;
  onSend: (text: string) => void;
  onImagePress?: () => void;
  placeholder?: string;
  showImageButton?: boolean;
};