import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { CircleAlert, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react-native";

import { KeyboardAvoidingWrapper, Screen } from "../../../components/common";
import { Button, Card, IconButton, Input, Text } from "../../../components/ui";
import { colors } from "../../../constants/theme";
import { login } from "../authSlice";
import { useAppDispatch } from "../../../store/hooks";

export function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (reason) {
      setError(typeof reason === "string" ? reason : "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen className="px-6 py-8">
      <KeyboardAvoidingWrapper>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow"
        >
          <Card className="gap-4 p-6">
            <Text variant="title">Sign in</Text>
            <Text variant="muted">
              Sign in with the email and password for your account.
            </Text>
            <Input
              label="Email"
              leftIcon={Mail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
            />
            <Input
              label="Password"
              leftIcon={Lock}
              secureTextEntry={!isPasswordVisible}
              autoComplete="password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
              right={
                <IconButton
                  icon={isPasswordVisible ? EyeOff : Eye}
                  size={18}
                  color={colors.muted}
                  accessibilityLabel={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  onPress={() => setIsPasswordVisible((value) => !value)}
                />
              }
            />
            {error ? (
              <View className="flex-row items-center gap-2">
                <CircleAlert color={colors.danger} size={16} strokeWidth={2} />
                <Text variant="caption" className="flex-1 text-danger">
                  {error}
                </Text>
              </View>
            ) : null}
            <Button
              icon={LogIn}
              label={isSubmitting ? "Signing in..." : "Sign in"}
              disabled={isSubmitting}
              onPress={() => {
                void handleLogin();
              }}
            />
            <Button
              variant="ghost"
              label="Create an account"
              disabled={isSubmitting}
              onPress={() => router.push("/register")}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </Screen>
  );
}
