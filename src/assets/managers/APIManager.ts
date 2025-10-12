// import axios from 'axios';
// import type { CancelTokenSource, Method, RawAxiosRequestHeaders } from 'axios';
// import { router } from 'expo-router';
// import { isEmpty, isNil, startsWith } from 'lodash';
// import type { getClerkInstance } from '@clerk/clerk-expo';
// import type { APIGenericResponse, APIGenericResponseData } from '@/types/api';
// import { ContentType } from '@/types/api';

// class APIManager {
//   private _baseUrl: string;
//   private _clerkInstance?: ReturnType<typeof getClerkInstance>;
//   private _pendingRequestCancelTokens: CancelTokenSource[];
//   private _clerkListener?: () => void;

//   constructor(baseUrl: string) {
//     this._baseUrl = baseUrl;
//     this._pendingRequestCancelTokens = [];
//   }

//   isAuthenticated = () => {
//     return !isNil(this._clerkInstance) && !isNil(this._clerkInstance.session);
//   };

//   setClerkInstance = (clerkInstance: ReturnType<typeof getClerkInstance>) => {
//     if (this._clerkInstance === clerkInstance) return;

//     this._clerkInstance = clerkInstance;
//     this._subscribeClerk();
//   };

//   signOut = () => {
//     this._removeClerkListener();
//   };

//   GET = async <T>(
//     path: string,
//     params?: Record<string, any> | undefined,
//     cancelTokenSource?: CancelTokenSource | undefined
//   ): Promise<APIGenericResponse<T>> =>
//     this.request<T>(
//       'GET',
//       path,
//       undefined,
//       params,
//       undefined,
//       cancelTokenSource
//     );

//   POST = async <T>(
//     path: string,
//     data?: any,
//     cancelTokenSource?: CancelTokenSource | undefined
//   ): Promise<APIGenericResponse<T>> =>
//     this.request<T>(
//       'POST',
//       path,
//       undefined,
//       undefined,
//       data,
//       cancelTokenSource
//     );

//   PATCH = async <T>(
//     path: string,
//     data?: any,
//     cancelTokenSource?: CancelTokenSource | undefined
//   ): Promise<APIGenericResponse<T>> =>
//     this.request<T>(
//       'PATCH',
//       path,
//       undefined,
//       undefined,
//       data,
//       cancelTokenSource
//     );

//   PUT = async <T>(
//     path: string,
//     data?: any,
//     cancelTokenSource?: CancelTokenSource | undefined
//   ): Promise<APIGenericResponse<T>> =>
//     this.request<T>('PUT', path, undefined, undefined, data, cancelTokenSource);

//   DELETE = async <T>(
//     path: string,
//     data?: any,
//     cancelTokenSource?: CancelTokenSource | undefined
//   ): Promise<APIGenericResponse<T>> =>
//     this.request<T>(
//       'DELETE',
//       path,
//       undefined,
//       undefined,
//       data,
//       cancelTokenSource
//     );

//   request = async <T>(
//     method: Method,
//     path: string,
//     headers?: RawAxiosRequestHeaders,
//     params?: Record<string, any> | undefined,
//     data?: any,
//     cancelTokenSource?: CancelTokenSource | undefined
//   ): Promise<APIGenericResponse<T>> => {
//     if (isNil(cancelTokenSource))
//       cancelTokenSource = axios.CancelToken.source();

//     this._pendingRequestCancelTokens.push(cancelTokenSource);

//     try {
//       const url = startsWith(path, 'http') ? path : `${this._baseUrl}${path}`;

      
//       if (isNil(headers)) {
//         headers = {} as RawAxiosRequestHeaders;
//       }

//       const token = await this._clerkInstance?.session?.getToken();
//       if (token && !headers?.Authorization) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }

//       if (method !== 'GET' && !isNil(data)) {
//         if (data instanceof FormData) {
//           headers['Content-Type'] = ContentType.FORM_DATA;
//         } else {
//           headers['Content-Type'] = ContentType.JSON;
//           data = JSON.stringify(data);
//         }
//       }

//       const fetchData = async () =>
//         axios.request<APIGenericResponseData<T>>({
//           method,
//           url,
//           headers,
//           params,
//           data,
//           cancelToken: cancelTokenSource.token,
//         });

//       const rawResponse = await fetchData();

//       const response = rawResponse.data;

//       return { response };
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         this._cancelAllPendingRequests();
//         router.replace('/(auth)');
//       }

//       return { error };
//     } finally {
//       this._removePendingToken(cancelTokenSource);
//     }
//   };

//   isSucceed = (response: any) => {
//     if (isEmpty(response)) return;

//     let responseData: APIGenericResponseData<any>;
//     if ((response as APIGenericResponse<any>).response)
//       responseData = (response as APIGenericResponse<any>).response!;
//     else responseData = response as APIGenericResponseData<any>;

//     return responseData && responseData.success;
//   };

//   passedMessageError = (response: APIGenericResponseData<any>) => {
//     if (isEmpty(response)) return '';

//     return response.message;
//   };

//   transformToFormData = (data: Record<string, any>) => {
//     const formData = new FormData();

//     for (const key in data) {
//       if (Object.prototype.hasOwnProperty.call(data, key)) {
//         const value = data[key];

//         if ( value && typeof value === 'string') {
//           if (value.startsWith('file://') || value.startsWith('content://')) {
//             const uriParts = value.split('/');
//             const filename = uriParts[uriParts.length - 1] || 'image.jpg';

//             const extension =
//               filename.split('.').pop()?.toLowerCase() || 'jpeg';
//             let mimeType = 'image/jpeg';

//             switch (extension) {
//               case 'png':
//                 mimeType = 'image/png';
//                 break;
//               case 'jpg':
//               case 'jpeg':
//                 mimeType = 'image/jpeg';
//                 break;
//               case 'gif':
//                 mimeType = 'image/gif';
//                 break;
//               case 'webp':
//                 mimeType = 'image/webp';
//                 break;
//               default:
//                 mimeType = 'image/jpeg';
//             }

//             const file = {
//               uri: value,
//               type: mimeType,
//               name: filename,
//             } as any;

//             formData.append(key, file);
//           } else {
//             formData.append(key, value);
//           }
//         } else if (value !== undefined && value !== null) {
//           formData.append(key, value);
//         }
//       }
//     }

//     return formData;
//   };

//   _subscribeClerk = () => {
//     if (!this._clerkInstance) return;

//     this._removeClerkListener();

//     // this._clerkListener = this._clerkInstance.addListener(async () => {});
//   };

//   _removeClerkListener = () => {
//     if (this._clerkListener) {
//       this._clerkListener();
//       this._clerkListener = undefined;
//     }
//   };

//   _cancelAllPendingRequests = () => {
//     this._pendingRequestCancelTokens.forEach(token => token.cancel());
//     this._pendingRequestCancelTokens = [];
//   };

//   _removePendingToken = (token: CancelTokenSource) => {
//     this._pendingRequestCancelTokens = this._pendingRequestCancelTokens.filter(
//       t => t !== token
//     );
//   };
// }

// export default new APIManager(process.env.EXPO_PUBLIC_BASE_URL || '');
