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

import { z } from 'zod';


export const profileSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống' })
    .email({ message: 'Email không hợp lệ' }),
  name: z
    .string()
    .min(1, { message: 'Tên không được để trống' })
});

export type ProfileForm = z.infer<typeof profileSchema>;

export const profileFormDefaultValues: ProfileForm = {
  email: '',
  name: '',
};