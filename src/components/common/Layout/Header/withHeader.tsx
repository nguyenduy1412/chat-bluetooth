// import React from 'react';
// import { useTheme } from '@react-navigation/native';
// import { Header } from '@/components/common/Layout/Header';
// import type { HeaderProps } from '@/components/common/Layout/Header';
// import SafeAreaView from '../../SafeAreaView';
// import { Box } from '../Box';

// export type WithHeaderOptions = {
//   header?: HeaderProps | false;
//   safeArea?: boolean;
//   backgroundColor?: string;
// };

// export function withHeader<P extends object>(
//   Component: React.ComponentType<P>,
//   options: WithHeaderOptions = {}
// ) {
//   const WrappedComponent = (props: P) => {
//     const { colors } = useTheme();
//     const { header, safeArea = true, backgroundColor } = options;

//     const content = (
//       <Box flex={1} backgroundColor={backgroundColor || colors.background}>
//         {header !== false && <Header {...header} />}
//         <Box flex={1}>
//           <Component {...props} />
//         </Box>
//       </Box>
//     );

//     if (safeArea) {
//       return <SafeAreaView>{content}</SafeAreaView>;
//     }

//     return content;
//   };

//   return WrappedComponent;
// }

// export default withHeader;
