import { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { KeyboardAvoidingWrapper, Screen } from "../../../components/common";
import { Button, Card, Input, Text } from "../../../components/ui";
import { authService } from "../../../services/auth";
import { login } from "../../../store/slices";
import { useAppDispatch } from "../../../store/hooks";

export function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const demoHint = authService.getDemoHint();

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
            Use the demo account for now. API sign-in will replace this later.
          </Text>
          <Input
            label="Email"
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
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          {error ? (
            <Text variant="caption" className="text-danger">
              {error}
            </Text>
          ) : null}
          {demoHint ? (
            <Text variant="caption" className="text-slate-500">
              {demoHint}
            </Text>
          ) : null}
          <Button
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
