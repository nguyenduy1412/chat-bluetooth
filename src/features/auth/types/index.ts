import { z } from 'zod';


export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'login.emailRequired' })
    .email({ message: 'login.emailInvalid' }),
  password: z
    .string()
    .min(1, { message: 'login.passwordRequired' })
    .min(6, { message: 'login.passwordMin' }),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const loginFormDefaultValues: LoginForm = {
  email: '',
  password: '',
};