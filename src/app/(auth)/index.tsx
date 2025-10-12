
import { useTheme } from "@react-navigation/native";
import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Animated, { useAnimatedStyle, interpolate, useSharedValue } from "react-native-reanimated";
import { Box } from "../../components/common/Layout/Box";
import StartLogo from "../../components/common/StartLogo";
import LoginFormScreen from "../../features/auth/components/LoginFormScreen";

import { KeyboardAvoidingView, Platform } from "react-native";

const LoginScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [80, "50%"], []);
  const animatedIndex = useSharedValue(0);

  // Animate logo theo index
  const logoStyle = useAnimatedStyle(() => {
    // index = 0 => ở snap 80
    // index = 1 => ở snap 50%
    const translateY = interpolate(animatedIndex.value, [0, 1], [0, -200]);
    return {
      transform: [{ translateY }],
      flex: 1,
    };
  });

  return (
    <Box style={{ flex: 1 }}>
      <Animated.View style={logoStyle}>
        <StartLogo />
      </Animated.View>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        animateOnMount={true}
        animatedIndex={animatedIndex}
        handleStyle={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          borderTopWidth: 0.2,
          borderStartWidth: 0.2,
          borderEndWidth: 0.2,
          borderTopColor: colors.textSecondary,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.text,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
        <BottomSheetView style={{ backgroundColor: colors.background, flex: 1 }}>
          
          <LoginFormScreen />
        </BottomSheetView>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Box>
  );
};

export default LoginScreen;
