export type Model = {
    id: string;
    name: string;
    size: number;
    value?: string;
};

export type ItemSetting = {
    id: string;
    title: string;
    icon: any;
    size?: number;
    onPress?: () => void;
};