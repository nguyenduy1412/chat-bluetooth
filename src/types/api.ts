// import type { UseMutationOptions } from '@tanstack/react-query';

// export type EntityBase = {
//   id?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// };

// export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
//   Awaited<ReturnType<FnType>>;

// export type QueryConfig<T extends (...args: any[]) => any> = Omit<
//   ReturnType<T>,
//   'queryKey' | 'queryFn'
// >;

// export type MutationConfig<
//   MutationFnType extends (...args: any) => Promise<any>,
// > = UseMutationOptions<
//   ApiFnReturnType<MutationFnType>,
//   Error,
//   Parameters<MutationFnType>[0]
// >;

// export type APIGenericResponseData<T> = {
//   success: boolean;
//   message: string;
//   data?: T;
// };

// export type APIGenericResponse<T> = {
//   error?: any;
//   response?: APIGenericResponseData<T>;
// };

// export enum ContentType {
//   JSON = 'application/json;charset=UTF-8',
//   TEXT = 'text/plain;charset=UTF-8',
//   FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
//   FORM_DATA = 'multipart/form-data',
// }
