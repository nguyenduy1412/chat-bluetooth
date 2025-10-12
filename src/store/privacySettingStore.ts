import { create } from 'zustand';

type PrivacySettingState = {
    shareLocation: boolean;
    setShareLocation: (shareLocation: boolean) => void;
    toggleShareLocation: () => void;
    cloakMode: boolean;
    setCloakMode: (cloakMode: boolean) => void;
    toggleCloakMode: () => void;
    timeMode: boolean;
    toggleTimeMode: () => void;
    startTime: Date | null;
    setStartTime: (time: Date | null) => void;
    endTime: Date | null;
    setEndTime: (time: Date | null) => void;
    statusCustom: boolean;
    toggleStatusCustom: () => void;
    yourStatus: string | null;
    setYourStatus: (yourStatus: string | null) => void;
};

const usePrivacySettingStore = create<PrivacySettingState>((set, get) => ({
    shareLocation: false,
    setShareLocation: (shareLocation: boolean) => {
        set({ shareLocation });
    },
    toggleShareLocation: () => {
        set({ shareLocation: !get().shareLocation });
    },
    cloakMode: false,
    setCloakMode: (cloakMode: boolean) => {
        set({ cloakMode });
    },
    toggleCloakMode: () => {
        set({ cloakMode: !get().cloakMode });
    },
    timeMode: false,
    toggleTimeMode: () => {
        set({ timeMode: !get().timeMode });
    },
    startTime: null,
    setStartTime: (time: Date | null) => {
        set({ startTime: time });
    },
    endTime: null,
    setEndTime: (time: Date | null) => {
        set({ endTime: time });
    },
    statusCustom: false,
    toggleStatusCustom: () => {
        set({ statusCustom: !get().statusCustom });
    },
    yourStatus: null,
    setYourStatus: (yourStatus: string | null) => {
        set({ yourStatus });
    }
}));

export default usePrivacySettingStore;
