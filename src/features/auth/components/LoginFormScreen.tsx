
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LoginForm, loginFormDefaultValues, loginSchema } from "../types";

import { useTranslation } from "react-i18next";
import { Box } from "../../../components/common/Layout/Box";
import { Text } from "../../../components/common/Text/Text";
import Input from "../../../components/common/TextField/Input";
import { translate } from "../../../i18n/translate";
import TextField from "../../../components/common/TextField/TextField";
import Button from "../../../components/common/Button/Button";

const LoginFormScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginFormDefaultValues,
  });
  const { t } = useTranslation();
  const onSubmit = useCallback(async (data: LoginForm) => {
    console.log("Login data:", data);
    if (true) {
      // showToast(translate('auth.loginError'), 'error');
      return;
    }
  }, []);
  return (
    <Box justifyContent="center" alignItems="center" px={20}>
      <Box mb={30}>
        <Text align="center" fontWeight={"bold"} fontSize={20}>
          {t("auth.login")}
        </Text>
      </Box>
      
      <Input
        as={TextField}
        name="email"
        control={control}
        label={translate("auth.email")}
        placeholder={translate("auth.emailPlaceholder")}
        multiline
        numberOfLines={1}
        required
      />
      <Input
        as={TextField}
        name="password"
        control={control}
        label={translate("auth.password")}
        placeholder={translate("auth.passwordPlaceholder")}
        secureTextEntry
        error={errors.password?.message}
      />
      <Button
        title={translate("auth.login")}
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
      />

    </Box>
  );
};

export default LoginFormScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    marginHorizontal: 20,
    paddingTop: 20,
    gap: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
