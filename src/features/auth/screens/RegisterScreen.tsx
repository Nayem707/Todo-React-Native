import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  CircleAlert,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react-native";

import { KeyboardAvoidingWrapper, Screen } from "../../../components/common";
import { Button, Card, IconButton, Input, Text } from "../../../components/ui";
import { colors } from "../../../constants/theme";
import { register } from "../authSlice";
import { useAppDispatch } from "../../../store/hooks";

export function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await dispatch(register({ name, email, password })).unwrap();
    } catch (reason) {
      setError(typeof reason === "string" ? reason : "Registration failed.");
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
            <Text variant="title">Create account</Text>
            <Text variant="muted">
              Passwords must be at least 8 characters and include a letter and a
              number.
            </Text>
            <Input
              label="Name"
              leftIcon={User}
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              editable={!isSubmitting}
            />
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
              icon={UserPlus}
              label={isSubmitting ? "Creating account..." : "Create account"}
              disabled={isSubmitting}
              onPress={() => {
                void handleRegister();
              }}
            />
            <Button
              variant="ghost"
              label="Already have an account"
              disabled={isSubmitting}
              onPress={() => router.push("/login")}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </Screen>
  );
}
